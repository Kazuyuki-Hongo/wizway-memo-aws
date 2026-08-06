import json
import os
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import boto3

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
}

# sam local では本物の DynamoDB の代わりにメモリを使う（学習用）
_LOCAL_ITEMS: list[dict] = []
_ITEM_PATH = re.compile(r"/items/([^/]+)$")


def _response(status_code: int, body: dict | list):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False, default=_json_default),
    }


def _json_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def _path(event) -> str:
    return event.get("rawPath") or event.get("path") or ""


def _method(event) -> str:
    rc = event.get("requestContext") or {}
    http = rc.get("http") or {}
    return (http.get("method") or event.get("httpMethod") or "GET").upper()


def _use_local_store() -> bool:
    return bool(os.environ.get("AWS_SAM_LOCAL")) or not os.environ.get("ITEMS_TABLE")


def _table():
    return boto3.resource("dynamodb").Table(os.environ["ITEMS_TABLE"])


def _list_items():
    if _use_local_store():
        return list(_LOCAL_ITEMS)

    result = _table().scan(Limit=50)
    items = result.get("Items") or []
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items


def _create_item(title: str):
    item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    if _use_local_store():
        _LOCAL_ITEMS.insert(0, item)
        return item

    _table().put_item(Item=item)
    return item


def _delete_item(item_id: str) -> bool:
    if _use_local_store():
        before = len(_LOCAL_ITEMS)
        _LOCAL_ITEMS[:] = [x for x in _LOCAL_ITEMS if x.get("id") != item_id]
        return len(_LOCAL_ITEMS) < before

    _table().delete_item(Key={"id": item_id})
    return True


def lambda_handler(event, context):
    path = _path(event)
    method = _method(event)

    if method == "OPTIONS":
        return _response(200, {"ok": True})

    if path.endswith("/hello") and method == "GET":
        return _response(
            200,
            {
                "message": "Hello World",
                "service": "wizway-hello-aws",
                "app": "雑メモボード（サンプル）",
            },
        )

    item_match = _ITEM_PATH.search(path)
    if item_match and method == "DELETE":
        item_id = item_match.group(1)
        _delete_item(item_id)
        return _response(200, {"deleted": item_id})

    if path.rstrip("/").endswith("/items"):
        if method == "GET":
            return _response(200, {"items": _list_items()})

        if method == "POST":
            try:
                payload = json.loads(event.get("body") or "{}")
            except json.JSONDecodeError:
                return _response(400, {"error": "invalid JSON"})

            title = (payload.get("title") or "").strip()
            if not title:
                return _response(400, {"error": "title is required"})
            if len(title) > 200:
                return _response(400, {"error": "title too long"})

            return _response(201, _create_item(title))

    return _response(404, {"error": "not found", "path": path, "method": method})
