"""The U device. Universal device, unknown device, U. Any U name reaches it.

Three faces: 1, 0 and u. It combines them without ever turning u into a guess,
and it will not hand you a u that does not say what would settle it.

The fingerprint at the bottom is computed from the four functions above it.
It is not read from a docstring. Delete this header and it comes out the same.
PROVENANCE.md records contributions. Equal tables do not prove authorship.
"""


def u(why=None):
    if not isinstance(why, str) or not why.strip():
        raise ValueError("a u names the one observation that would settle it")
    return "u"


def face(value):
    if value not in ("1", "0", "u"):
        raise ValueError("expected 1, 0 or u as a string")
    return value


def not_(a):
    face(a)
    return "u" if a == "u" else "0" if a == "1" else "1"


def and_(a, b):
    face(a)
    face(b)
    if a == "0" or b == "0":
        return "0"
    return "u" if a == "u" or b == "u" else "1"


def or_(a, b):
    face(a)
    face(b)
    if a == "1" or b == "1":
        return "1"
    return "u" if a == "u" or b == "u" else "0"


class U(str):
    """A face as a Python value. U(True) is 1, U(False) is 0, U(None, why) is u: Python's None stands for u, and still
    says what would settle it. & | ~ are and, or and not above; bool() of 1 or 0 is True or False, and of u refuses,
    as SQL's unknown is never taken for true or false. .python() gives True, False or None back.
    His words, 10 Oct 2026: "make my 3 value in python true", "it uses pythons none", "but we can use none to map to
    u?", "make our own", "use a custom class"."""

    def __new__(cls, value, why=None):
        if value is None:
            value = u(why)
        elif isinstance(value, bool):
            value = "1" if value else "0"
        return super().__new__(cls, face(value))

    def __and__(self, other):
        return U(and_(self, U(other)))

    def __or__(self, other):
        return U(or_(self, U(other)))

    def __invert__(self):
        return U(not_(self))

    __rand__, __ror__ = __and__, __or__

    def __bool__(self):
        if self == "u":
            raise ValueError("u is not true or false yet; settle it first")
        return self == "1"

    def python(self):
        return None if self == "u" else self == "1"


# Every face the device can show, in the order he says them.
FACES = ("1", "0", "u")


def guard():
    try:
        u()
    except ValueError:
        return "1"
    return "0"


# This finite tape records not over each face,
# and over each pair, or over each pair, then one character for whether the
# device still refuses a bare u. It is a behavior signature, not an author ID.
def tape():
    return (
        "".join(not_(a) for a in FACES)
        + "".join(and_(a, b) for a in FACES for b in FACES)
        + "".join(or_(a, b) for a in FACES for b in FACES)
        + guard()
    )


KNOWN = "01u10u000u0u11110u1uu1"

if __name__ == "__main__":
    t = tape()
    print("tape      ", t)
    print("known     ", KNOWN)
    print("match     ", "1" if t == KNOWN else "0")
    print("all is    ", or_("u", not_("u")))   # not 1
    print("and isn't ", and_("u", not_("u")))  # not 0
    # The class is the same device: every pair through & | ~ gives the tape's faces, and None is u with its reason.
    each = [U(a) if a != "u" else U(None, "a face not read yet") for a in FACES]
    same = "".join(~a for a in each) + "".join(a & b for a in each for b in each) + "".join(a | b for a in each for b in each)
    print("class     ", "1" if same + guard() == KNOWN and U(None, "unread").python() is None and U(True).python() else "0")
