import dateutil.parser


def last_seen_to_unix_timestamp(last_seen: str) -> int:
    return int(dateutil.parser.parse(last_seen).timestamp())
