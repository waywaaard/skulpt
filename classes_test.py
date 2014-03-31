import numpy as np
print "Test arange"
a = np.arange(3)
print a

a = np.arange(3.0)
print a

a = np.arange(3,7)
print a

a = np.arange(3,7,2)
print a

print "Test linspace"

a = np.linspace(2.0, 3.0, 5)
print a

a = np.linspace(2.0, 3.0, 5, False)
print a

a = np.linspace(2.0, 3.0, 5, True, True)
print a