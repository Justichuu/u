# The fish carries a state

W/R/A account, 8 October 2026. Written before implementation.

**Current correction:** the owner specified two mirrored cycloids and asymmetry
in **both** placement/angle and phase/progress. The cubic construction documented
below is an earlier approximation. Its passing tests do not settle the corrected
geometry. The final construction and fresh checks are recorded at the end.

## Direction and evidence

[A] The owner's proposed symbols are circle = 1, Ichthys = 2, triangle = 3.
The fish's role is to carry a binary state through a continuing process.
The tail matters: passing the crossing does not end the process. Dotted tails
mark continuation in the illustration, not an observed infinite execution.

[W] In the preceding calculator session, iDoMath enclosed every parameter cell
for the circle (640), continued fish (640), and triangle (600). These are
engine enclosure reports, not an independent witness of the parametric graph.
The native renderer used solid boxes; the earlier dotted image was rendered
outside the calculator. Neither rendering proves a logical interpretation.

[W] `idomath_check` returned true by exact algebra for `1-(1-b)=b` and
`3*t*(1-t)*(12-t)/50 + (-3*t*(1-t)*(12-t)/50) = 0`.
At t = 1 it returned true for `3*t*(1-t)*(12-t)/50 = 0`.
`idomath_run` settled 1+2=3, 2+3=5 and 3+5=8 by exact arithmetic.
These checks establish the stated identities, not that shapes add or generate
truth values. The symbols for 5 and 8 have not been defined.

## Contract to implement

[A] Represent the carried state by `(value, progress, reason)`. The value is
one of U's existing strings `1`, `0`, `u`. Progress is a finite nonnegative
number. A `u` retains a nonempty reason naming what would settle it.

[R] Advancing progress preserves value and reason. Negation delegates to
`u.js`'s `not`: it exchanges 1 and 0 and preserves u. No additional truth
table, truth value, U2 encoding or U5 encoding is needed.

[A] Use the two reflected cubic branches of the earlier D4 petal:

    X(t) = -1 + 6t/5 + 87t²/50 - 47t³/50
    Y(t) = 3t(1-t)(12-t)/50
    C₀(t) = (X(t), Y(t)); C₁(t) = (X(t), -Y(t))

The petal occupies 0 <= t <= 1. The displayed tail continues to 13/10.
Extending the polynomial is a construction, not evidence for future events.
The drawing uses finite floating-point display coordinates, not exact proof.
The carried process can advance beyond the displayed window.

[R] Reflection implements negation for known values because both branches
have the same X coordinate and opposite Y coordinates. At t=0 and t=1 the
points coincide, yet the carried branch identities remain distinct. Later
polynomial intersections likewise do not merge states. Screen position must
never be used to infer the value, including the sign of Y after the crossing.

[A] A carried `u` has no selected branch. Show both candidates as unsettled,
even when they share coordinates. This is a representation of unavailable
knowledge; it does not assert that 0 and 1 are simultaneously true. A crossing
does not create u. A negated u keeps the observation needed to settle it.

## Scope and ways to be wrong

[A] Implement one shared fish layer on U's existing logic, expose it through
the package and browser entry, and propagate the built entry and explanatory
links to maintained consumers. Keep the finite logic tape unchanged.
Existing protocol-only consumers and U2/U5 receive no unrelated behavior.
Publication is separate from local implementation.

[R] This supplies state transport and negation, not a complete geometric
semantics for AND, OR or entailment. Those operations remain U's existing
operations. No claim is made that binary logic has a necessary fish shape,
that this cubic is a cycloid, or that the numeric sequence proves the symbols.

[A] Checks must fail if crossing changes a value, swimming changes a reason,
double negation fails, u picks a branch, invalid progress is silently accepted,
the browser uses a different implementation, or the existing tape changes.
Package tests, interaction checks and downstream byte comparisons will supply
the implementation evidence. Their results belong below, dated after running.

## Implementation observations

The account above preceded implementation. The observations below were added
after the named checks on 8 October 2026.

[W] The first `test/fish.test.mjs` run failed because the module did not exist.
After implementation its four cases passed. An independent review found that
`swim(carry('0', 2**53), 1)` silently stayed in place. A new regression failed
before the correction and passed after ineffective positive advances were
refused. Incomplete manually constructed states are also refused. Finite
floating-point progress is not a claim of exact arbitrary-precision time.

[W] The fish-consumers review arm checked the source and consumer paths; the
fish-browser arm implemented the browser integration and its interaction test.
The lead implemented the state module, regression tests, account and site
explanation, and reviewed both arms' results. The review arm's additional
3,903 sampled checks found no ordinary-input formula or reflection mismatch;
sampling is not a proof over every input.

[W] `node verify.mjs` observed the same 22-result tape in JavaScript, Python
and POSIX shell. `node --test 'test/*.test.mjs'` passed all 39 cases, including
the fish and existing U2/U5 cases. `idomath_check` proved the factored X formula
in `fishGraph` equals the previously graphed expanded cubic by exact algebra.

[W] `checks/fish-browser.mjs` passed in Chromium, Firefox and WebKit. It tested
the crossing, NOT twice, refusal of a missing u reason, both labelled candidates
at the crossing, continued progress past the display, invalid advances,
restart, the old finite-table controls, and the actual offline download.
The 320px and 980px layouts, including a long unbroken reason, had no horizontal
page overflow. No page errors or HTTP requests were observed on the original
pages. Desktop/crossing and narrow captures were visually inspected.

[W] The initial browser check caught an advance input whose step restriction
refused 0.05. The source now accepts any valid nonnegative distance. An initial
download check saved an extensionless temporary file, which opened as text;
the corrected check opens the actual download saved with its HTML filename.

[W] `build-browser.mjs --check --site PATH_TO_SITE` checks both maintained
browser copies with the website's explicit `data-proportion` marker retained.
The export writes existing U entries only. The website U page explains the
role and links to the interactive section. Rod consumes only the unchanged
protocol/audio modules. The Half visualizer and three-value triangle chart
use different declared representations; neither requires replacement.

[W] The first source-manifest check found CRLF-only drift in two unchanged
baseline files. Restoring the repository's declared LF endings reconciled
those bytes without changing their text. The new manifest records this change's
source files; matching it is a byte check, not an independent correctness proof.

[A] The proposed correspondence remains an interpretation after implementation.
Physical devices, screen-reader use, a complete geometric logic and universal
future behavior remain unmeasured. No publication is asserted by this account.

## Cycloids and asymmetry correction, same session

[W] The owner corrected “parallel” to “mirrored” and immediately reiterated
“Asymmetry”. Treating that correction as permission to drop asymmetry was an
agent error. The previous body used cubic polynomials; the existing library's
Cycloid implementation instead uses `r*(theta-sin(theta))` and
`r*(1-cos(theta))` (`model.js`, `cycloidThrough` and its path generator).

[A] Earlier design context motivates using symmetry and asymmetry together.
It supplies no measured angle, phase, scale or particular curve transform.

[R] A whole pair related by one exact reflection has that reflection symmetry.
Asymmetry needs an additional specified feature, such as placement, unequal
segments, or progress. The state contract can preserve branch identity while
that geometry changes; NOT need not be represented by a simple screen-axis
reflection after an asymmetric placement.

[W] Asked whether asymmetry belongs to placement/angle, phase/progress, or both,
the owner answered “Both”. The earlier cubic is not relabelled as a cycloid.

## Corrected construction: two cycloids, both kinds of asymmetry

[A] Choose a shallow cycloid segment with a = pi/6 and D = a + 1/2.
These dimensions and the initial settings below are an adjustable illustration,
not parameters recovered from historical messages. For z = a(2t-1), use

    B(t) = ((z + sin(z))/D, (cos(z) - sqrt(3)/2)/D).

[R] This is the standard cycloid `r(theta-sin(theta)), r(1-cos(theta))`,
with r = 1/D, theta = pi+z, translated by (-r*pi, -r*(1+sqrt(3)/2)).
It is a cycloid segment under uniform scaling and translation, not a cubic
that merely resembles one. B(0)=(-1,0) and B(1)=(1,0).

[A] The first branch is B(t). For the second, let M(x,y)=(x,-y), let R rotate
by the relative angle, and use

    C1(t) = (-1,0) + R M (B(phase + pace*t) - B(phase)).

Both branches start at the head. The second's reflected placement, phase and
pace can differ from the first's. Initial angle = 3 degrees, phase = 0.05 and
pace = 1.05 are examples. The symmetric reference sets all three to 0, 0, 1.

[R] NOT still exchanges the two labels at the same process time. With the
asymmetric transform, it is not generally a reflection of the displayed point.
An intersection may have two distinct process times, one on each branch.
Consequently the earlier “both at the crossing at t=1” example applies to the
symmetric reference, not the asymmetric default. Double negation restores the
same labelled state regardless of which geometry is used to draw it.

[A] The display locates a second intersection numerically, checks its residual,
and starts each dotted tail at that branch's own intersection parameter.
Failure to find a second intersection in the displayed window is named; it
does not manufacture a join. The exported curve formulas can be enclosed in
iDoMath. A numerical intersection marker is not an exact root proof.

## Fresh observations after the cycloid correction

[W] The actual-cycloid regression failed against the cubic, then passed with
the new construction. All 42 Node tests pass, and JavaScript, Python and shell
still produce the original tape. Seven fish tests cover the cycloid definition,
state transport, reflection in the symmetric control, distinct labels at shared
coordinates, default asymmetry, calculator/display formula agreement, and
invalid inputs. The source checks refuse ineffective positive progress too.

[W] The default numerical search returned branch times 0.848619717557 and
0.807630638572 near (0.705444246061, 0.0665026611184), with the required residual
check. In the symmetric reference both times are 1. These are finite numerical
observations, not exact roots or a uniqueness proof.

[W] The browser arm's revised checks passed in Chromium, Firefox and WebKit:
independent angle, phase and pace changes; label exchange at equal process
time; the symmetric reference; unknown candidates; invalid pace; an unsuccessful
intersection search; continuation; the old tape; actual offline download;
320/980px layouts and a long unbroken reason. Fresh screenshots were inspected.

[W] U's `graphFor` exports were loaded into the unmodified iDoMath calculator.
For signed parameter t, a=(abs(t)-t)/2 and b=(abs(t)+t)/2 join the branches as
X0(a)+X1(b)+1, Y0(a)+Y1(b), since both begin at (-1,0). The native window
enclosed all 640 cells, with zero unsettled cells; record digest
`11985bbda627e48e94d65cba8d53362aef9b21ef8c1e23027404da49aceb5ae3`.
The calculator screenshot was visually inspected. Its native tails remain
solid proof boxes; the interactive U view supplies dotted continuation.
No independent parametric witness or exact intersection proof was run.

## Fractal continuation: design before implementation

[A] The requested fractal mode will repeat the complete cycloid fish at smaller
scales. Two fixed similarities attach each child's head to a point on a parent
branch. Every copy inherits the chosen angle, phase and pace. A depth control
shows finite approximations; depth zero retains the original fish.

[A] Start with scale 0.55, attachment progress 0.28 on branch 0 and 0.68 on
branch 1, and rotations +30 degrees and -30 degrees plus the relative angle.
These are illustrative design choices. Each map is reused at every level.

[R] Since the similarity scale is less than one, repeated copies shrink.
The infinite construction is the compact limit of the seed fish together
with its recursively transformed copies. The screen shows a bounded finite
depth, not infinitely many pixels. Overlap has not been excluded, so no exact
fractal dimension is asserted from the two-map count alone.

[A] Recursive addresses identify copies, not truth values. Swimming and NOT
retain their existing state contract; the original fish's marker remains the
state reference. Checks will cover shrinking, head attachment, transform
composition, depth bounds, input refusal, existing logic and browser controls.

## Fractal observations

[W] `fish-fractal.js` supplies the two similarities and bounded recursive copies.
Four new tests cover all depths 0–6, 1–127 copies, contraction, head attachment,
parent/child composition, inherited phase and angle, and invalid inputs. All
46 Node tests pass; the three runtime behavior tapes remain identical.

[W] Chromium, Firefox and WebKit passed the depth control with the keyboard,
unchanged carried state, inherited geometry, the existing fish interactions,
320/980px layouts and the actual offline download. Depths 3 and 6 were captured;
the Chromium images were visually inspected. The smaller fish branch from
their parents into a tree. No native-calculator check of this recursion was run.

[R] Writing S for the displayed seed and T0, T1 for the two similarities, the
infinite construction satisfies F = S union T0(F) union T1(F). Including S
retains the fish at every generation. This is a condensation construction;
the finite display includes all generations through the chosen depth.

## Pando analogy, 8 October 2026

[A] Pando offers an analogy of connected forms sharing an origin. The fish
preview repeats one seed through fixed similarities. This is not a biological
model of Pando, clonal growth or biodiversity. The
[US Forest Service account of Pando](https://www.fs.usda.gov/r04/fishlake/recreation/explore-forest/pando)
describes one seed and new shoots from an expanding root system. That account
is the source of the analogy, not evidence for these geometric parameters.
