# u

The U device. Universal device, unknown device, U. It answers to any of them.

Three faces instead of two: **1** measured and it holds, **0** measured and it
does not, **u** nobody measured it. Two faces make a machine that has to answer
everything, so it answers some things falsely.

![How the fingerprint grows back. Three faces, 1, 0 and a greyed u, feed the four functions not, and, or and the refusal of a bare u. Running them writes a 22 character tape, 01u10u000u0u11110u1uu1. Hashing the tape gives the key 66cce8d50854, and the key looks up the list of names in PROVENANCE.md. Below, a copy with its header burned off and its functions renamed to q0 and q1 still writes the same tape, so the same key still finds the same names.](assets/fingerprint.svg)

## The four lines

```js
const u   = why => { if (!why) throw new Error("a u names what would settle it"); return "u" };
const not = a => a === "u" ? "u" : a === "1" ? "0" : "1";
const and = (a, b) => a === "0" || b === "0" ? "0" : a === "u" || b === "u" ? "u" : "1";
const or  = (a, b) => a === "1" || b === "1" ? "1" : a === "u" || b === "u" ? "u" : "0";
```

Paste that into any browser console. It is the whole device, it needs nothing
installed, and it writes the same fingerprint as everything else in here.

The first line is what makes it a device rather than a truth table. A `u` has
to name the one observation that would settle it. Ask for a bare one and it
throws. A shrug that survives review is how a wrong thing gets built on top of
nothing.

Run a thing against its own opposite and neither law of the old logic holds:

```js
const x = u("whether anybody actually measured it");  // "u"
or(x, not(x))    // "u". Not 1. A thing and its opposite do not cover everything.
and(x, not(x))   // "u". Not 0. They do not cancel out either.
```

All is and isn't all.

## Two layers

| | what it is | where |
|---|---|---|
| **The logic** | The four functions, in three languages, plus the fingerprint they write. This is the part you paste. | `u.js` `u.py` `u.sh` |
| **The protocol** | `u-device/1`. Register an adapter, send it a payload, get back a `1`, `0` or `U` with an evidence statement, on a hash-chained receipt. | `u.mjs` `STANDARD.md` |

The repository versions of the three ports add one thing the four lines above
leave out: they reject anything that is not `1`, `0` or `u` instead of quietly
treating it as true. That validation does not change the fingerprint, which is
the point. Two implementations, one written tight and one written careful, and
you can prove they are the same device by running both.

## The fingerprint

Run every function over every face and write the answers down in order. Three
for `not`, nine for `and`, nine for `or`, and one character for whether a bare
`u` is still refused. Twenty two characters:

```text
01u10u000u0u11110u1uu1
```

That is the fingerprint, and it is not stored anywhere. It is what the code
does, read back out, so it is the answers and not the source. Hash it:

```text
sha256("01u10u000u0u11110u1uu1")
  = 66cce8d50854ee21b9964b5bdcb3aa80054f6da5e24de6258c268ea6e3942a35
```

The first twelve, `66cce8d50854`, are the key. Check it yourself with
`printf %s 01u10u000u0u11110u1uu1 | sha256sum`. It opens
[PROVENANCE.md](PROVENANCE.md) and [chuumind.com/u](https://chuumind.com/u).

## Burning it off

```text
node burn.mjs
```

That deletes every comment, renames every function to junk, runs what is left,
and prints the tape. Zero words naming an owner survive. The tape does.

So the fingerprint burns off. It buys you the time between your deletion and
somebody running the device and hashing the answer, because the record that key
opens is not in your copy. Hidden evidence, for a short while. Spend it however
you like.

Change the tables and the key changes with them. You have not stolen the
device, you have written a different one, and it is yours. That was never
restricted.

## Licence

`LICENSE` carries the U Device Licence 1.0, which asks you to keep the
provenance record and to make any burn return. If that licence is unusable to
you for any reason, the same file grants MIT instead, at your option, with no
notice to anybody. Taking MIT does not remove the fingerprint, because the
fingerprint was never a term. It is a fact about the code.

## Run it

```text
node u.js          the device, and the tape it writes
python u.py        same tape
sh u.sh            same tape, no runtime at all
node verify.mjs    all three at once, and the rules the tape is watching
node burn.mjs      burn the header off and watch the tape come back
node --test "test/*.test.mjs"    the protocol and logic suite, 14 tests
```

`verify.mjs` exits 0 when every runtime was measured and agreed, 1 on a
disagreement, and **2 when nothing failed and not everything was looked at**.
A runtime that is not installed is reported `u`, never skipped and never
counted as a pass. A check that could not look and a check that found nothing
are different results and are not allowed to print the same colour.

## Who made it

Two sessions were handed one instruction at the same time and could not see
each other, so it was built twice, from two different readings, and both are in
here. [PROVENANCE.md](PROVENANCE.md) has the record, the faces and the story.

## What is not checked here

Three runtimes on one machine, Windows, 23 September 2026: Node 26.7.0, Python
3.14.7, and the `sh` that ships with Git for Windows. All three wrote the same
tape. No other operating system or runtime was observed. That a fourth language
would agree is reasoned from the code, which is comparison and string building
and nothing else. It is not witnessed. Go and be the fourth.
