#This fork adds:

Python specific
- [x] __issubclass__ builtin
- [x] __name__ attribute on classes/types

numpy:
- [x] ndarray (working, missing functions)
- [x] linspace
- [x] array 
- [x] ones
- [x] zeros
- [x] arange
- [x] asarray that maps to array (no real functionality, though not needed on a python-js-interpreter)

Some of the trigonmetric functions aswell ```dot``` requires https://github.com/josdejong/mathjs to work.
However most functions have a fallback, otherwise an OperationError will be thrown

See following test code for examples:
```python
import numpy as np

a = [[1, 2], [3, 4]]

b = np.array(a, ndmin=3)
print "np.array(a, ndmin=3)"
c = np.ones(b.shape)
print "np.ones(b.shape): %s" % (c,)
d = np.zeros(b.shape)
print "np.zeros(b.shape): %s" % (d,)
print "__str__: %s" % b
print "__repr__: %r" % b
print "__len__: %s" % len(b)
print "shape %s" % (b.shape,)
print "ndim %s" % b.ndmin
print "data: %s"  % (b.data,)
print "dtype: %s" % b.dtype
print "size %s" % b.size
print "b.tolist %s" % (b.tolist(),)
b.fill(9)
print "fill: %s" % (9)
print "b[0, 0] = 2"
b[0, 0] = 2
print b
print ""
print "np.full((2,2), 2.0)"
c = np.full((2,2), 2.0, int)

print "===================="
print "     operations"
print "===================="
print "c = %s" % (c,)
print "c + 2 = %s" % (c + 2,)
print "c - 2 = %s" % (c - 2,)
print "c * 2 = %s" % (c * 2,)
print "c / 2 = %s" % (c / 2,)
print "c ** 2 = %s" % (c ** 2,)
#print "c + 2 = %s" % (c + 2,)
#print "-c = %s" % (-c,)

print "===================="
print "   trigonometric    "
print "===================="
c = np.full((2,2), 0, int)
print "c = %s" % (c,)
print "np.sin(c) = %s" % (np.sin(c),)
print "np.cos(c) = %s" % (np.cos(c),)
print "np.tan(c) = %s" % (np.tan(c),)
print "np.arcsin(c) = %s" % (np.arcsin(c),)
print "np.arccos(c) = %s" % (np.arccos(c),)
print "np.arctan(c) = %s" % (np.arctan(c),)
#print "np.sinh(c) = %s" % (np.sinh(c),)
#print "np.cosh(c) = %s" % (np.cosh(c),)
#print "np.tanh(c) = %s" % (np.tanh(c),)
print "np.sin([0,1]) = %s" % (np.sin([0,1]),)
print "np.sin((0,1)) = %s" % (np.sin((0,1)),)

print "===================="
print "      various       "
print "===================="
ar = np.arange(3.0)
print "np.arange(3.0): %s, dtype: %s" % (ar, ar.dtype)
ar = np.arange(3)
print "np.arange(3): %s, dtype: %s" % (ar, ar.dtype)
ar = np.arange(3,7)
print "np.arange(3,7): %s, dtype: %s" % (ar, ar.dtype)
ar = np.arange(3,7, 2)
print "np.arange(3,7, 2): %s, dtype: %s" % (ar, ar.dtype)
ar = np.linspace(2.0, 3.0, num=5)
print "np.linspace(2.0, 3.0, num=5): %s" % (ar,)
ar = np.linspace(2.0, 3.0, num=5, endpoint=False)
print "np.linspace(2.0, 3.0, num=5, endpoint=False): %s" % (ar,)
ar = np.linspace(2.0, 3.0, num=5, retstep=True)
print "np.linspace(2.0, 3.0, num=5, retstep=True): %s" % (ar,)
```

matplotlib:
- [x] plot(*args, **kwargs) with multiple lines
- [x] using d3js
- [x] show 
- [x] kwargs
- [x] all color specs
- [x] color cycle
- [x] rc params
- [x] '.', 'o', 'x', 's' markers
- [x] resize function for markers
- [x] '-', '--', '.-' line styles
- [x] various Line2D attributes
- [x] auto scaling for axes

math:
- [x] updated math module using mathjs.org

complex:
- [ ] adding support for complex numbers (should rely on mathjs.org)

# Welcome to Skulpt

Skulpt is a Javascript implementation of Python 2.x.  Python that runs in your browser!  Python that runs on your iPad!  Its being used several projects including, [Interactive Python Textbooks](http://interactivepython.org) -- You can see skulpt in action there.  Try out [some turtle graphics examples](http://interactivepython.org/courselib/static/thinkcspy/PythonTurtle/helloturtle.html) to see Skulpt in action.

[![Build Status](https://travis-ci.org/skulpt/skulpt.png)](https://travis-ci.org/skulpt/skulpt)

## Origins

Skulpt is the brainchild of Scott Graham.  See [Skulpt.org](http://skulpt.org) for some early demos of skulpt in action.

Brad Miller has been shepherding the development since sometime in 2010/2011.

## How can I help

Check out the ideas list below. And then some practical things for getting started after that.

### Ideas List

6. Expand the skulpt standard library to include more modules from the CPython standard library.  So far we have math, random, turtle, time (partial) random (partial) urllib (partial) unittest, image, DOM (partial) and re (partial).  Any of the partial modules could be completed, or many other CPython modules could be added.  Potential new modules from the standard library include:  functools, itertools, collections, datetime, operator, and string.  Many of these would be relatively easy projects for a less exeperienced student to take on.

7. Over time we have had numerous requests for more advanced Python modules to be included in Skulpt.  These include, portions of matplotlib, tkinter, and numpy.  These are much more challenging because they contain C code in their implementation, but if a reasonable subset could be implemented in Javascript this would make it much easier to directly add many more python modules that rely on these three.  In addition, it would allow for skulpt to potentially be used in teaching an even broader set of topics.

5. Expand and clean up the foreign function API.  This API is critical for implementing parts of the standard library.

3. Do a better job of supporting Python3 semantics, but make
Python2/Python3 behavior configurable with a single flag. Sk.python3 is
already there for this purpose.  Another positive step in this direction would be to update our grammar to Python2.7.  Updating the grammar would allow us to add set literals, dictionary comprehensions, and other features present in 2.7.x and Python 3.3.x.  This would be an excellent project for a student interested in language design, parsing, and the use of abstract syntax trees.

4. Make fully workable, and expand support for DOM access as
part of the standard library.

1. Currently builtin types (list, tuple, string, etc) are not subclassable.  Making the builtins subclassable would eliminate several known bugs in Skulpt.

1. Expand and improve overall language coverage.   Currently Skulpt does an excellent job of meeting the 80/20 rule.  We cover the vast majority of the language features used by the 80% (maybe even 90%) of the coede.  But there are builtins that are not implemented at all, and there are builtins with only partial implementations.  

1.  Change the execution model so that each line/step is interruptible.
Currently, skulplt runs an entire python program from beginning to end.  We have an interrupt timer in place to prevent programs from running more than 30 seconds, during that thirty seconds, the browser is locked up.  Over time we have had various suggestions on how to restructure the main interpreter so that the program could be interrupted after each line.  This is an advanced project, that would need a lot of testing and a lot of Javascript skill to make sure that we do not sacrifice too much performance for the gain of interruptability.

2.  Implement the hooks for a debugger. This may be a half step towards
1 or may be in a completely different direction, but allowing students
to debug line by line a program they have written would have some real
benefit.


### Practical Matters

There is plenty of work still to do in making improvements to Skulpt.  If you would like to contribute

1. Create a Github account if you don't already have one
2. Create a Fork of the Skulpt repository -- This will make a clone of the repository in your account.  **DO NOT** clone this one.  Once you've made the fork you will clone the forked version in your account to your local machine for development.
3. Read the HACKING.rst file to get the "lay of the land".  If you plan to work on creating  a module then you may also find this [blog post] (http://reputablejournal.com/blog/2011/03/19/adding-a-module-to-skulpt/) helpful.
3. Check the issues list for something to do.
4. Fix or add your own features.  Commit and push to your forked version of the repository.  When everything is tested and ready to be incorporated into the master version...
5. Make a Pull Request to get your feature(s) added to the main repository.


## Community

Check out the mailing list:  https://groups.google.com/forum/?fromgroups#!forum/skulpt

## Acknowledgements

* First and foremost to Scott Graham for starting the original project.
* Bob Lacatena for lots of work on Python longs
* Charles Severence for bug fixes and the re module.

