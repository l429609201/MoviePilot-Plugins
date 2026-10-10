#!/usr/bin/env python3
"""构建可复现的 V3 插件发行包；只有 --publish 才允许写 GitHub。"""

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile


class BuildError(RuntimeError):
    pass


EXCLUDED = {"vue", "node_modules", "__pycache__", ".git", ".pytest_cache", ".mypy_cache", ".ruff_cache", "dist"}
STRINGS = re.compile(r'''["']([^"'\n]+)["']''')
ASSET_EXTENSIONS = (".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".wasm")
CSS_URLS = re.compile(r"url\(\s*([^'\"\s)][^\s)]*)\s*\)")
VERSION = re.compile(r"[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?\Z")


def command(args, root):
    return subprocess.run(args, cwd=root, capture_output=True, text=True, check=False)


def checked(args, root):
    result = command(args, root)
    if result.returncode:
        raise BuildError(f"命令失败 {args[0]}: {result.stderr.strip()}")
    return result.stdout


def git(root, *args):
    return checked(["git", *args], root)


def source_files(root, ref=None):
    if ref:
        return git(root, "ls-tree", "-r", "--name-only", ref).splitlines()
    paths = []
    # 在遍历前剪枝，避免扫描前端源码和庞大的 node_modules。
    for directory, subdirs, filenames in os.walk(root / "plugins.v3", followlinks=False):
        subdirs[:] = [name for name in subdirs if name not in EXCLUDED]
        for name in filenames:
            if name.endswith(".py"):
                paths.append((Path(directory) / name).relative_to(root).as_posix())
    return paths


def read_bytes(root, name, ref=None):
    if ref:
        result = subprocess.run(["git", "show", f"{ref}:{name}"], cwd=root, capture_output=True, check=False)
        if result.returncode:
            raise BuildError(f"标签 {ref} 缺少 {name}，请提高版本号")
        return result.stdout
    path = root / name
    if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
        raise BuildError(f"缺失文件或路径越界: {name}")
    return path.read_bytes()


def dependencies(text, name):
    # Federation 将 CSS 文件名存放在数组中，因此同时识别相对路径与裸 CSS 文件名。
    values = STRINGS.findall(text)
    if name.endswith(".css"):
        values += CSS_URLS.findall(text)
    for value in values:
        if value.startswith("data:"):
            continue
        clean = value.split("?", 1)[0].split("#", 1)[0]
        if not clean.lower().endswith(ASSET_EXTENSIONS):
            continue
        if value.startswith(("http:", "https:", "//")):
            raise BuildError(f"前端依赖不是本地文件: {name}: {value}")
        if value.startswith("/"):
            raise BuildError(f"前端依赖路径越界: {name}: {value}")
        yield clean


def collect_payload(root, class_name, metadata, ref=None):
    lower = class_name.lower()
    prefix = f"plugins.v3/{lower}/"
    version = metadata.get("version")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", class_name) or not isinstance(version, str) or not VERSION.fullmatch(version):
        raise BuildError(f"非法插件类名或版本: {class_name}")
    entry = read_bytes(root, prefix + "__init__.py", ref)
    try:
        tree = ast.parse(entry.decode("utf-8"))
    except (SyntaxError, UnicodeDecodeError) as exc:
        raise BuildError(f"插件入口无效: {class_name}: {exc}") from exc
    classes = [node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == class_name]
    if len(classes) != 1:
        raise BuildError(f"插件类名不匹配: {class_name}")
    versions = [node.value for node in classes[0].body if isinstance(node, ast.Assign)
                and any(isinstance(target, ast.Name) and target.id == "plugin_version" for target in node.targets)]
    if len(versions) != 1 or not isinstance(versions[0], ast.Constant) or versions[0].value != version:
        raise BuildError(f"插件版本不匹配: {class_name}")
    payload = {}
    for name in source_files(root, ref):
        if name.startswith(prefix) and name.endswith(".py") and not any(part in EXCLUDED for part in PurePosixPath(name[len(prefix):]).parts):
            payload[name] = read_bytes(root, name, ref)
    payload[prefix + "__init__.py"] = entry
    payload["LICENSE"] = read_bytes(root, "LICENSE", ref)
    assets = prefix + "dist/assets/"
    remote = assets + "remoteEntry.js"
    if ref:
        has_frontend = remote in source_files(root, ref)
    else:
        has_frontend = (root / (prefix + "dist")).exists() or (root / (prefix + "vue")).exists()
    if has_frontend:
        pending = [remote]
        while pending:
            name = pending.pop()
            if name in payload:
                continue
            data = read_bytes(root, name, ref)
            payload[name] = data
            if not name.endswith((".js", ".css")):
                continue
            text = data.decode("utf-8")
            if name.endswith(".css"):
                # 只接受插件容器或 Vue scoped 样式，禁止污染宿主页面。
                stripped = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
                selectors = re.findall(r"([^{}]+)\{", stripped)
                for selector in selectors:
                    selector = selector.strip()
                    if selector.startswith("@") or re.fullmatch(r"(?:from|to|[0-9.% ,]+)", selector):
                        continue
                    if any(".mp-plugin" not in item and "[data-v-" not in item for item in selector.split(",")):
                        raise BuildError(f"CSS 未限定插件作用域: {name}")
            payload[name] = data
            for dependency in dependencies(text, name):
                base = PurePosixPath(name).parent
                parts = []
                for part in (base / dependency).parts:
                    if part == "..":
                        if not parts:
                            raise BuildError(f"前端依赖路径越界: {dependency}")
                        parts.pop()
                    elif part != ".":
                        parts.append(part)
                resolved = "/".join(parts)
                if not resolved.startswith(assets):
                    raise BuildError(f"前端依赖路径越界: {dependency}")
                pending.append(resolved)
    return payload


def plans(root, require_tracked=False, plugin_ids=None):
    root = Path(root).resolve()
    metadata = json.loads(read_bytes(root, "package.v3.json"))
    if not isinstance(metadata, dict):
        raise BuildError("package.v3.json 必须为对象")
    # 每个插件独立读取自己的版本；可限定只构建指定插件，不设置全仓版本。
    selected = set(plugin_ids or [])
    if selected - set(metadata):
        raise BuildError("未知插件: " + ", ".join(sorted(selected - set(metadata))))
    releases = []
    for name, item in sorted(metadata.items()):
        if selected and name not in selected:
            continue
        if not isinstance(item, dict):
            raise BuildError(f"插件元数据无效: {name}")
        if item.get("release") is not True:
            continue
        payload = collect_payload(root, name, item)
        releases.append({"class": name, "version": item["version"], "tag": f"{name}_v{item['version']}",
                         "zip": f"{name.lower()}_v{item['version']}.zip", "metadata": item, "payload": payload})
    if not releases:
        raise BuildError("未找到 release=true 的插件")
    if require_tracked:
        tracked = set(git(root, "ls-files", "-z").split("\0"))
        required = {"package.v3.json"}
        for release in releases:
            required.update(release["payload"])
        missing = sorted(required - tracked)
        if missing:
            raise BuildError("发行文件未被 Git 跟踪: " + ", ".join(missing))
    return releases


def build(root, output, require_tracked=False, plugin_ids=None):
    releases = plans(root, require_tracked, plugin_ids)
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    index = []
    for release in releases:
        path = output / release["zip"]
        lower = release["class"].lower()
        prefix = f"plugins.v3/{lower}/"
        with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, data in sorted(release["payload"].items()):
                relative = "LICENSE" if name == "LICENSE" else name[len(prefix):]
                info = zipfile.ZipInfo(f"{lower}/{relative}", (1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                info.create_system = 3
                archive.writestr(info, data, compresslevel=9)
        print(f"已构建 {release['class']} {release['version']} → {release['zip']}")
        release["path"] = path.resolve()
        index.append({key: release[key] for key in ("class", "version", "tag", "zip")}
                     | {"sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    (output / "releases.json").write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return releases


def api_get(root, repository, endpoint):
    result = command(["gh", "api", "--method", "GET", f"repos/{repository}/{endpoint}"], root)
    if result.returncode:
        if re.search(r"\bHTTP 404\b", result.stderr):
            return None
        raise BuildError(f"GitHub 查询失败: {result.stderr.strip()}")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise BuildError("GitHub 返回无效 JSON") from exc


def tag_commit(root, repository, tag):
    ref = api_get(root, repository, f"git/ref/tags/{tag}")
    if ref is None:
        return None
    obj = ref["object"]
    seen = set()
    while obj["type"] == "tag":
        if obj["sha"] in seen:
            raise BuildError("标签对象存在循环")
        seen.add(obj["sha"])
        obj = api_get(root, repository, f"git/tags/{obj['sha']}")["object"]
    if obj["type"] != "commit":
        raise BuildError("标签未指向 commit")
    return obj["sha"]


def publish(root, releases, repository, target):
    if not repository or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise BuildError("发布需要 --repository owner/repo")
    if not target or not re.fullmatch(r"[0-9a-fA-F]{40}", target):
        raise BuildError("发布需要 --target 完整 40 位 SHA")
    if git(root, "rev-parse", "HEAD").strip().lower() != target.lower():
        raise BuildError("发布 target 必须等于当前 HEAD")
    # 所有插件先预检，任意冲突时不创建部分发行。
    creates = []
    for release in releases:
        prefix = f"plugins.v3/{release['class'].lower()}"
        dirty = git(root, "status", "--porcelain", "--untracked-files=all", "--", prefix, "package.v3.json", "LICENSE")
        if dirty.strip():
            raise BuildError(f"发行路径存在未提交改动: {prefix}")
        existing = api_get(root, repository, f"releases/tags/{release['tag']}")
        commit = tag_commit(root, repository, release["tag"])
        if existing is not None and commit is None:
            raise BuildError(f"已有 Release 缺少标签: {release['tag']}")
        if commit:
            # 不抓取或改写本地标签；checkout 的全部历史必须含有该对象。
            old_meta = json.loads(read_bytes(root, "package.v3.json", commit)).get(release["class"])
            if old_meta != release["metadata"] or collect_payload(root, release["class"], old_meta, commit) != release["payload"]:
                raise BuildError(f"已有标签内容变化: {release['tag']}，请提高版本号")
        if existing is None:
            creates.append(release)
    for release in creates:
        checked(["gh", "release", "create", release["tag"], str(release["path"]), "--repo", repository,
                 "--target", target, "--title", release["tag"], "--notes",
                 release["metadata"].get("history", {}).get(f"v{release['version']}", release["metadata"].get("description", ""))], root)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plugin", action="append", dest="plugin_ids", help="只构建指定插件ID，可重复指定；版本取自该插件索引")
    parser.add_argument("--require-tracked", action="store_true")
    parser.add_argument("--output", default="release-build")
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--repository", default=os.environ.get("GITHUB_REPOSITORY"))
    parser.add_argument("--target", default=os.environ.get("GITHUB_SHA"))
    args = parser.parse_args(argv)
    root = Path(__file__).resolve().parents[1]
    try:
        releases = build(root, root / args.output, args.require_tracked or args.publish, args.plugin_ids)
        if args.publish:
            publish(root, releases, args.repository, args.target)
        print(f"已构建 {len(releases)} 个发行包" + ("，发布检查完成" if args.publish else "（未发布）"))
    except (BuildError, OSError, ValueError) as exc:
        parser.exit(1, f"发行失败: {exc}\n")


if __name__ == "__main__":
    main()
