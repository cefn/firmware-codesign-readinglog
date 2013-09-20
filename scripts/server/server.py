#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import zorba_api
import re
import os
import shutil
import urllib
import mimetypes

store = zorba_api.InMemoryStore_getInstance()
zorba = zorba_api.Zorba_getInstance(store)
factory = zorba.getItemFactory()

PORT_NUMBER = 8080

# defines how the server should handle different requests
class myHandler(BaseHTTPRequestHandler):
		
	#Handler for the GET requests
	def do_GET(self):
		
		# root path alias
		if(self.path == "/"):
			self.path = "/index.xq"
					
		# process the request
		try:
			
			#define handlers, each returning (mimetype, result) pair
			def xquery(resource,params):
				filepath = "xquery/" + resource
				xquery = zorba.compileQuery(open(filepath, 'r').read())
				for name, value in params.iteritems():
					xquery.getDynamicContext().setVariable(name,factory.createString(value));
				return (
					'text/html',
					xquery.execute()
				)
			def binary(resource,params):
				filepath = "public/" + resource
				return (
					mimetypes.guess_type(filepath), 
					open(filepath,"rb")
				)

			# map from paths to handlers
			sitemap = [ 	
				("\w+.xq",xquery),
				("\w+.\w+",binary)
			]

			# generic mapping routine, which permits either strings or files to be returned as a result
			for (pattern,handler) in sitemap:
				try:
					
					# processes full path (including parameters) into matching chunks
					[(resource,paramstring)] = re.findall("^/(" + pattern + ")((?:\?[\s\w=&%]+)?)$",self.path)
					paramstring = urllib.unquote(paramstring)
					
					# unmarshall get parameters
					params = {}
					for (name,value) in re.findall("(\w+)=([\s\w]+)",paramstring):
						params[name]=value
					
					# get response to this resource request, using the specified params
					(mimetype,result) = handler(resource,params)
					
					# marshall response
					self.send_response(200)
					self.send_header("Content-type",mimetype)
					
					if type(result) is str:
						self.end_headers()
						self.wfile.write(result)						
					elif type(result) is file:		
						self.send_header("Content-Length", str(os.fstat(result.fileno())[6]))
						self.end_headers()
						shutil.copyfileobj(result, self.wfile)
						
					return # exit the loop - the request has been handled
						
				except ValueError: # this pattern can't unpack the request
					pass

		except (IOError) as e:
			self.send_error(404,str(e))
		
try:
	#Create a web server and define the handler to manage 
	# the incoming request
	server = HTTPServer(('', PORT_NUMBER), myHandler)
	print 'Started Reading Log server on port ' , PORT_NUMBER
	
	#Wait forever for incoming http requests
	server.serve_forever()

except KeyboardInterrupt:
	print '^C received, shutting down the web server'
	server.socket.close()
	zorba.shutdown()
	zorba_api.InMemoryStore_shutdown(store)