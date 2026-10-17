"""Reasons that travel, built only on u: why.js's Python port, which says why in full.

A value is its face, the reasons that could still change it, and `by`, who answered. not, and and or carry them; a
1 or 0 with no reasons is final; settled() asks of the knowing; witnesses() is many working as one, all agreeing or u,
never a vote; settle() asks settlers each question. Faces come from u.py's own not_, and_ and or_: no table here.
verify.mjs runs both ports over the same formulas and compares what they print, byte for byte.

    python why.py < formulas.json    prints each formula's answer as JSON, as `node why.js` does
"""
import importlib.util
import json
import sys
from pathlib import Path
from typing import NamedTuple


def _faces():
    """u.py beside this file, by its path: a program that loads why.py from elsewhere gets this u, never another."""
    spec = importlib.util.spec_from_file_location("u_faces", Path(__file__).with_name("u.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_U = _faces()
FACES, _and, _not, _or, u = _U.FACES, _U.and_, _U.not_, _U.or_, _U.u


class Said(NamedTuple):
    face: str
    why: tuple = ()
    by: tuple = ()

    def plain(self):
        return {"face": self.face, "why": list(self.why), "by": list(self.by)}


def _said(face, why=(), by=()):
    return Said(face, tuple(why), tuple(by))


def known(face, by=None):
    if face not in ("1", "0"):
        raise TypeError("a known value says 1 or 0")
    if by is not None and (not isinstance(by, str) or not by.strip()):
        raise TypeError("a witness is named by a sentence")
    return _said(face, (), () if by is None else (by,))


def unknown(why):
    return _said(u(why), (why,))   # u() refuses a reason that names nothing


def value(x):
    x = x._asdict() if isinstance(x, Said) else x
    if (not isinstance(x, dict) or x.get("face") not in FACES or not isinstance(x.get("why"), (list, tuple))
            or (x["face"] == "u" and not x["why"]) or not isinstance(x.get("by", ()), (list, tuple))
            or not all(isinstance(b, str) and b.strip() for b in x.get("by", ()))):
        raise TypeError("a value is known(1 or 0) or unknown(reason)")
    for reason in x["why"]:
        u(reason)   # each reason passes u's own refusal of a u that names nothing
    return _said(x["face"], x["why"], x.get("by", ()))


def _union(*lists):
    return tuple(dict.fromkeys(item for one in lists for item in one))


def _step(face, decider, a, b):
    a, b = value(a), value(b)
    deciders = [x for x in (a, b) if x.face == decider and not x.why]
    if deciders:
        return _said(face(a.face, b.face), (), _union(*(x.by for x in deciders)))
    return _said(face(a.face, b.face), _union(a.why, b.why), _union(a.by, b.by))


def not_(a):
    x = value(a)
    return _said(_not(x.face), x.why, x.by)


def and_(a, b):
    return _step(_and, "0", a, b)


def or_(a, b):
    return _step(_or, "1", a, b)


def settled(a):
    x = value(a)
    return _said("0" if x.face == "u" else "1", x.why, x.by)


def witnesses(said_by, about=None):
    names = list(said_by)
    if not names:
        raise TypeError("witnesses need at least one witness, by name")
    heard = [value(said_by[n]) for n in names]

    def every(f):
        all_ = "1"
        for x in heard:
            all_ = _and(all_, f(x.face))
        return all_

    face = "1" if every(lambda f: f) == "1" else "0" if every(_not) == "1" else u("the witnesses do not agree yet")
    split = face == "u" and any(x.face != "u" for x in heard)   # u, and someone did answer: say who said what
    why = _union([", ".join(f"{n} says {x.face}" for n, x in zip(names, heard))] if split else [],
                 *(x.why for x in heard))
    by = _union([n if about is None else f"{n}: {about}" for n in names], *(x.by for x in heard))
    return _said(face, why, by)


def settle(formula, settlers):
    def ask(question):
        u(question)
        asked = {}
        for name, settler in settlers.items():
            try:
                asked[name] = value(settler(question))
            except Exception as error:   # a settler that throws is heard as u, never as an answer
                asked[name] = unknown(f'{name} did not answer "{question}": {error}')
        one = witnesses(asked, question)
        return _said("u", _union([question], one.why), one.by) if one.face == "u" else one
    return formula(ask)


def answer(f):
    """A formula as JSON: "1" or "0" known, any other string a question left u, ["not"|"settled", f],
    ["and"|"or", f, g], ["witnesses", {name: f, ...}]."""
    if isinstance(f, str):
        return known(f) if f in ("1", "0") else unknown(f)
    op = f[0]
    if op == "witnesses":
        return witnesses({n: answer(g) for n, g in f[1].items()})
    if op in ("not", "settled"):
        return {"not": not_, "settled": settled}[op](answer(f[1]))
    return {"and": and_, "or": or_}[op](answer(f[1]), answer(f[2]))


if __name__ == "__main__":
    formulas = json.loads(sys.stdin.buffer.read().decode("utf-8-sig"))   # a pipe may lead with a BOM
    print(json.dumps([answer(f).plain() for f in formulas], ensure_ascii=False, separators=(",", ":")))
