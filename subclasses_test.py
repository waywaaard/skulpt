print ''
print 'subclasses tests'
print "issubclass(int, int)"
print issubclass(int, int)
print "issubclass(int, (int, long))"
print issubclass(int, (int, long))
print "issubclass(int, long)"
print issubclass(int, long)

class Test1:
	def __init__(self):
		self.c1 = 0
		
print "issubclass(Test1, Test1)"
print issubclass(Test1, Test1)
		
class Test2:
	def __init__(self):
		self.c2 = 0
		
print "issubclass(Test1, Test2)"
print issubclass(Test1, Test2)
print "issubclass(Test2, Test1)"
print issubclass(Test2, Test1)

class Test3(Test1):
	def __init__(self):
		self.c2 = 0
		
print "issubclass(Test3, Test1)"
print issubclass(Test3, Test1)
print "issubclass(Test1, Test3)"
print issubclass(Test1, Test3)

class Test4(Test3):
	def __init__(self):
		self.c4 = 0;
		
print "issubclass(Test4, Test1)"
print issubclass(Test4, Test1)
print "issubclass(Test1, Test4)"
print issubclass(Test1, Test4)