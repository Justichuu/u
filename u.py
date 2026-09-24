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
