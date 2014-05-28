t = 3
g = 9.81

h = 0.5 * g * t**2

print "h(t) = %d" % h

import matplotlib.pyplot as pp
import numpy as np

t = np.linspace(0,10,10) #return ndarray
h = 0.5 * g * t**2

pp.plot(h, t, "--rx", linewidth=3, markersize=6, dash_capstyle="projecting", markerfacecolor="b");
pp.title("Free Fall")
pp.xlabel("t in seconds")
pp.ylabel("h in meters")
pp.show()