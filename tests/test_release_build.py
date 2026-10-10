"""发行合同回归测试；GitHub 调用全部模拟，不操作宿主仓库。"""

import importlib.util
import json
from pathlib import Path
import subprocess
import zipfile

import pytest


SPEC = importlib.util.spec_from_file_location("build_releases", Path(__file__).resolve().parents[1] / "scripts/build_releases.py")
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)
SHA = "a" * 40


@pytest.fixture
def repo(tmp_path):
    root = tmp_path / "repo"
    root.mkdir()
    files = {
        "package.v3.json": json.dumps({"DemoPlugin": {"version": "3.0.0", "release": True, "history": {"v3.0.0": "test"}}, "Disabled": {"release": False}}),
        "LICENSE": "license text\n",
        "plugins.v3/demoplugin/__init__.py": 'class DemoPlugin:\n    plugin_version = "3.0.0"\n',
        "plugins.v3/demoplugin/modules/api.py": "value = 1\n",
        "plugins.v3/demoplugin/modules/nested/helper.py": "value = 2\n",
        "plugins.v3/demoplugin/dist/assets/remoteEntry.js": 'const css=["style.css"];const load=()=>import("./page.js");',
        "plugins.v3/demoplugin/dist/assets/page.js": 'import "./shared.js";import("./nested/lazy.js");',
        "plugins.v3/demoplugin/dist/assets/shared.js": 'export const shared=1;',
        "plugins.v3/demoplugin/dist/assets/nested/lazy.js": 'import "../shared.js";',
        "plugins.v3/demoplugin/dist/assets/style.css": '.mp-plugin button{color:red}.other[data-v-abc]{color:blue}',
        "plugins.v3/demoplugin/dist/assets/orphan-old.js": "unused",
        "plugins.v3/demoplugin/vue/source.py": "excluded",
        "plugins.v3/demoplugin/node_modules/dependency.py": "excluded",
        "plugins.v3/demoplugin/__pycache__/cache.py": "excluded",
        "plugins.v3/demoplugin/cache.pyc": "excluded",
    }
    for name, content in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return root


def test_modules_graph_exclusions_and_license(repo):
    releases = builder.build(repo, repo / "output")
    assert len(releases) == 1
    assert releases[0]["tag"] == "DemoPlugin_v3.0.0"
    assert releases[0]["zip"] == "demoplugin_v3.0.0.zip"
    with zipfile.ZipFile(releases[0]["path"]) as archive:
        assert set(archive.namelist()) == {
            "demoplugin/__init__.py", "demoplugin/modules/api.py", "demoplugin/modules/nested/helper.py",
            "demoplugin/LICENSE", "demoplugin/dist/assets/remoteEntry.js", "demoplugin/dist/assets/page.js",
            "demoplugin/dist/assets/shared.js", "demoplugin/dist/assets/nested/lazy.js", "demoplugin/dist/assets/style.css",
        }
        assert archive.read("demoplugin/LICENSE") == b"license text\n"
    index = json.loads((repo / "output/releases.json").read_text())
    assert len(index[0]["sha256"]) == 64


def test_deterministic_zip(repo):
    first = builder.build(repo, repo / "one")[0]["path"].read_bytes()
    second = builder.build(repo, repo / "two")[0]["path"].read_bytes()
    assert first == second


@pytest.mark.parametrize("dependency", ["./missing.js", "../../escape.js", "/global.js"])
def test_missing_dependency_and_path_escape(repo, dependency):
    (repo / "plugins.v3/demoplugin/dist/assets/remoteEntry.js").write_text(f'import("{dependency}");')
    with pytest.raises(builder.BuildError):
        builder.build(repo, repo / "output")


def test_css_must_be_local(repo):
    (repo / "plugins.v3/demoplugin/dist/assets/style.css").write_text("body{color:red}")
    with pytest.raises(builder.BuildError, match="CSS"):
        builder.build(repo, repo / "output")


@pytest.mark.parametrize("entry", ['class Wrong:\n    plugin_version="3.0.0"\n', 'class DemoPlugin:\n    plugin_version="2.0.0"\n'])
def test_class_and_version_mismatch(repo, entry):
    (repo / "plugins.v3/demoplugin/__init__.py").write_text(entry)
    with pytest.raises(builder.BuildError, match="不匹配"):
        builder.build(repo, repo / "output")


@pytest.mark.parametrize("version", ["../outside", "v3.0.0", None])
def test_unsafe_version(repo, version):
    (repo / "package.v3.json").write_text(json.dumps({"DemoPlugin": {"version": version, "release": True}}))
    with pytest.raises(builder.BuildError, match="非法"):
        builder.plans(repo)


def test_missing_license(repo):
    (repo / "LICENSE").unlink()
    with pytest.raises(builder.BuildError, match="LICENSE"):
        builder.plans(repo)


def test_require_tracked_detects_metadata_license_and_modules(repo, monkeypatch):
    paths = set(builder.plans(repo)[0]["payload"]) | {"package.v3.json"}
    for missing in ("package.v3.json", "LICENSE", "plugins.v3/demoplugin/modules/api.py"):
        monkeypatch.setattr(builder, "git", lambda root, *args, missing=missing: "\0".join(sorted(paths - {missing})))
        with pytest.raises(builder.BuildError, match="未被 Git 跟踪"):
            builder.plans(repo, require_tracked=True)
    monkeypatch.setattr(builder, "git", lambda root, *args: "\0".join(sorted(paths)))
    assert builder.plans(repo, require_tracked=True)


def test_real_git_tracking_without_commit(repo):
    subprocess.run(["git", "init", "-q"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "add", "package.v3.json", "LICENSE", "plugins.v3"], cwd=repo, check=True, capture_output=True)
    assert builder.plans(repo, require_tracked=True)


@pytest.fixture
def publish_mock(repo, monkeypatch):
    release = builder.build(repo, repo / "output")[0]
    commands = []
    calls = []
    monkeypatch.setattr(builder, "git", lambda root, *args: SHA + "\n" if args == ("rev-parse", "HEAD") else "")
    monkeypatch.setattr(builder, "checked", lambda args, root: commands.append(args) or "")
    def get(root, repository, endpoint):
        calls.append(endpoint)
        return None
    monkeypatch.setattr(builder, "api_get", get)
    return release, commands, calls


def test_publish_new_requires_explicit_target_and_create_only(repo, publish_mock):
    release, commands, calls = publish_mock
    builder.publish(repo, [release], "owner/repo", SHA)
    assert calls == ["releases/tags/DemoPlugin_v3.0.0", "git/ref/tags/DemoPlugin_v3.0.0"]
    assert len(commands) == 1
    assert commands[0][:3] == ["gh", "release", "create"]
    assert commands[0][commands[0].index("--target") + 1] == SHA
    assert not any("delete" in cmd or "edit" in cmd for cmd in commands)


@pytest.mark.parametrize("target", [None, "abc", "b" * 40])
def test_publish_rejects_missing_or_wrong_target(repo, publish_mock, target):
    release, commands, calls = publish_mock
    with pytest.raises(builder.BuildError):
        builder.publish(repo, [release], "owner/repo", target)
    assert not commands and not calls


def test_publish_rejects_dirty_plugin(repo, publish_mock, monkeypatch):
    release, commands, calls = publish_mock
    monkeypatch.setattr(builder, "git", lambda root, *args: SHA if args[0] == "rev-parse" else " M plugins.v3/demoplugin/__init__.py")
    with pytest.raises(builder.BuildError, match="未提交"):
        builder.publish(repo, [release], "owner/repo", SHA)
    assert not commands and not calls


@pytest.mark.parametrize("changed", [False, True])
def test_existing_release_compares_tag_payload(repo, publish_mock, monkeypatch, changed):
    release, commands, calls = publish_mock
    monkeypatch.setattr(builder, "api_get", lambda root, repository, endpoint: {"id": 1})
    monkeypatch.setattr(builder, "tag_commit", lambda *args: "b" * 40)
    real_read = builder.read_bytes
    real_collect = builder.collect_payload
    monkeypatch.setattr(builder, "read_bytes", lambda root, name, ref=None: real_read(root, name))
    def collect(root, name, metadata, ref=None):
        payload = real_collect(root, name, metadata)
        if changed and ref:
            payload["plugins.v3/demoplugin/modules/api.py"] = b"changed"
        return payload
    monkeypatch.setattr(builder, "collect_payload", collect)
    if changed:
        with pytest.raises(builder.BuildError, match="提高版本号"):
            builder.publish(repo, [release], "owner/repo", SHA)
    else:
        builder.publish(repo, [release], "owner/repo", SHA)
    assert not commands


def test_api_404_is_distinct_from_auth_failure(repo, monkeypatch):
    monkeypatch.setattr(builder, "command", lambda *args: subprocess.CompletedProcess([], 1, "", "gh: Not Found (HTTP 404)"))
    assert builder.api_get(repo, "owner/repo", "releases/tags/x") is None
    monkeypatch.setattr(builder, "command", lambda *args: subprocess.CompletedProcess([], 1, "", "gh: Bad credentials (HTTP 401)"))
    with pytest.raises(builder.BuildError, match="GitHub"):
        builder.api_get(repo, "owner/repo", "releases/tags/x")


def test_annotated_tag_is_peeled(repo, monkeypatch):
    responses = iter([{"object": {"type": "tag", "sha": "b" * 40}}, {"object": {"type": "commit", "sha": SHA}}])
    monkeypatch.setattr(builder, "api_get", lambda *args: next(responses))
    assert builder.tag_commit(repo, "owner/repo", "tag") == SHA


def test_reachable_binary_assets_and_css_urls(repo):
    directory = repo / "plugins.v3/demoplugin/dist/assets"
    (directory / "style.css").write_text('.mp-plugin{background:url(image.png)}@font-face{font-family:test;src:url("font.woff2")}')
    (directory / "image.png").write_bytes(b"\x89PNG\x00\xff")
    (directory / "font.woff2").write_bytes(b"wOF2\xff")
    payload = builder.plans(repo)[0]["payload"]
    assert payload["plugins.v3/demoplugin/dist/assets/image.png"] == b"\x89PNG\x00\xff"
    assert "plugins.v3/demoplugin/dist/assets/font.woff2" in payload


def test_remote_asset_rejected_but_license_url_allowed(repo):
    path = repo / "plugins.v3/demoplugin/dist/assets/shared.js"
    path.write_text('// license https://example.com/license\nexport const shared=1;')
    assert builder.plans(repo)
    path.write_text('const image="https://example.com/image.png";')
    with pytest.raises(builder.BuildError, match="不是本地"):
        builder.plans(repo)


def test_missing_remote_entry_fails(repo):
    (repo / "plugins.v3/demoplugin/dist/assets/remoteEntry.js").unlink()
    with pytest.raises(builder.BuildError, match="remoteEntry"):
        builder.plans(repo)


def test_existing_metadata_change_requires_new_version(repo, publish_mock, monkeypatch):
    release, commands, calls = publish_mock
    monkeypatch.setattr(builder, "api_get", lambda *args: {"id": 1})
    monkeypatch.setattr(builder, "tag_commit", lambda *args: "b" * 40)
    monkeypatch.setattr(builder, "read_bytes", lambda *args: b'{"DemoPlugin":{"version":"3.0.0","release":true,"description":"old"}}')
    with pytest.raises(builder.BuildError, match="提高版本号"):
        builder.publish(repo, [release], "owner/repo", SHA)
    assert not commands


def test_preflight_conflict_prevents_all_creates(repo, publish_mock, monkeypatch):
    release, commands, calls = publish_mock
    second = dict(release, tag="DemoPlugin_v3.0.1")
    monkeypatch.setattr(builder, "api_get", lambda root, repository, endpoint: {"id": 1} if endpoint.endswith(second["tag"]) else None)
    monkeypatch.setattr(builder, "tag_commit", lambda root, repository, tag: None)
    with pytest.raises(builder.BuildError, match="缺少标签"):
        builder.publish(repo, [release, second], "owner/repo", SHA)
    assert not commands


def test_pure_python_plugin_needs_no_frontend(tmp_path):
    (tmp_path / "package.v3.json").write_text('{"DemoPlugin":{"version":"3.0.0","release":true}}')
    (tmp_path / "LICENSE").write_text("license")
    directory = tmp_path / "plugins.v3/demoplugin"
    directory.mkdir(parents=True)
    (directory / "__init__.py").write_text('class DemoPlugin:\n    plugin_version="3.0.0"\n')
    assert len(builder.plans(tmp_path)[0]["payload"]) == 2


def test_local_build_never_calls_github(repo, monkeypatch):
    monkeypatch.setattr(builder, "command", lambda *args: pytest.fail("local build must not call GitHub"))
    assert builder.build(repo, repo / "output")
