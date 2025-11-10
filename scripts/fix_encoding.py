from pathlib import Path

from ftfy import fix_text as ftfy_fix


SAFE_CHARS = {chr(c) for c in range(32, 127)}
SAFE_CHARS.update({"\n", "\r", "\t"})

CORRUPTED_EXTRA = {
    0x2510,
    0x251C,
    0x2524,
    0x252C,
    0x2551,
    0x255D,
    0x2563,
    0x2591,
    0x2592,
    0x2593,
}


def _is_candidate(ch: str) -> bool:
    code = ord(ch)
    if code > 0xFFFF:
        return False
    if code in CORRUPTED_EXTRA:
        return True
    if code < 128:
        return False
    return ch not in SAFE_CHARS


def clean_text(text: str) -> str:
    result: list[str] = []
    length = len(text)
    i = 0

    while i < length:
        ch = text[i]

        if not _is_candidate(ch):
            result.append(ch)
            i += 1
            continue

        best_match: tuple[int, str] | None = None

        for span in range(2, 7):
            j = i + span
            if j > length:
                break
            segment = text[i:j]
            if not all(_is_candidate(c) for c in segment):
                continue
            try:
                encoded = segment.encode("cp850")
            except UnicodeEncodeError:
                continue
            try:
                decoded = encoded.decode("utf-8")
            except UnicodeDecodeError:
                continue
            best_match = (span, decoded)

        if best_match:
            span, decoded = best_match
            result.append(decoded)
            i += span
        else:
            result.append(ch)
            i += 1

    tentative = "".join(result)
    return ftfy_fix(tentative)


def read_text_with_bom(path: Path) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xff\xfe"):
        return raw.decode("utf-16-le")
    if raw.startswith(b"\xfe\xff"):
        return raw.decode("utf-16-be")
    return raw.decode("utf-8", errors="ignore")


def main() -> None:
    root = Path("docs")
    targets = [p for p in root.rglob("*") if p.is_file() and p.suffix in {".html", ".js", ".css"}]

    for path in targets:
        original = read_text_with_bom(path)
        fixed = clean_text(original)
        if fixed != original:
            path.write_text(fixed, encoding="utf-8")


if __name__ == "__main__":
    main()

