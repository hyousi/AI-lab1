from z3 import *

xi = [Int("x_%d" % i) for i in range(5)]
s = Solver()
for x in xi:
    s.add(x >= 0, x <= 1)

s.add(xi[1] + xi[2] == 0)
s.add(xi[3] + xi[4] == 2)
s.add(xi[0] + xi[1] + xi[2] + xi[3] + xi[4] == 3)
s.add(xi[3] == 0)

print(s.check())
