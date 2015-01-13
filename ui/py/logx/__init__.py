import os,re,urllib,sys,traceback

'''
from PyQt5.QtCore import QObject,pyqtSlot,pyqtSignal,QUrl,QBuffer
from PyQt5.QtXmlPatterns import QXmlItem,QXmlName,QXmlQuery
from PyQt5.QtWebKitWidgets import QWebView
from PyQt5.QtWebKit import QWebSettings
from PyQt5.QtCore import pyqtRemoveInputHook
'''
from PyQt4.QtCore import pyqtRemoveInputHook
from PyQt4.QtCore import QObject,pyqtSlot,pyqtSignal,QUrl,QBuffer
from PyQt4.QtXmlPatterns import QXmlItem,QXmlName,QXmlQuery
from PyQt4.QtWebKit import QWebView,QWebSettings

from watchdog.observers import Observer

def debug_trace():
  '''Set a tracepoint in the Python debugger that works with Qt'''
  from pdb import set_trace
  pyqtRemoveInputHook()
  set_trace()
  
def handle_except(e=None):
    traceback.print_exc()
    return traceback.format_exc()

# hack to work around Qt's refusal to import XQuery modules
# https://bugreports.qt-project.org/browse/QTBUG-43414
# looks for a module import pattern in the XQuery source, just copies
# selected code from the imported file
# currently, just function definitions
# sourcepath_store will be populated with the paths of files loaded
def inline_import_sources(xquerypath, modulepathstore=None):

    # definitions of patterns used to process query and imported files
    import_pattern = 'import module namespace ([A-Za-z]+)="([^"]+)" at "([^"]+)";'
    declare_pattern = '(declare function.*?};|declare variable [^;]+;)'
    
    # get the original query and separate out the imports in it
    queryfile = open(xquerypath,'r')
    querysource = queryfile.read()
    queryfile.close()
    querysplit = re.split(import_pattern, querysource)
       
    # process the imports by grabbing source code from the imported file
    newquerysplit = [querysplit[0]] #include chunk before first declaration

    # number of capture groups in the import pattern
    num_capture_groups = 3
    strings_per_import = num_capture_groups + 1
    
    # for each module import, replace it with inlined funcs and vars
    for splitindex in range(1,len(querysplit),strings_per_import):
        #[bracketed patterns serve namespace and path from each match]
        import_groups = querysplit[splitindex:splitindex+strings_per_import]
        (localnamespace,globalnamespace,modulepath,following) = import_groups
        
        # add a namespace declaration corresponding to this import
        newquerysplit.append( 'declare namespace %s="%s";' % (localnamespace, globalnamespace))
        
        if(not(os.path.isabs(modulepath))):
            modulepath = os.path.normpath(os.path.join(os.path.dirname(xquerypath), modulepath))

        if modulepathstore != None:
            modulepathstore.append(modulepath)

        modulefile = open(modulepath,'r')
        modulesource = modulefile.read()
        modulefile.close()
        modulefunctionsplit = re.findall(declare_pattern,modulesource, re.MULTILINE|re.DOTALL)

        newquerysplit.append("\n\n".join(modulefunctionsplit) + "\n\n")
        newquerysplit.append(following)

    newquerysource = ''.join(newquerysplit) # rejoin all the string parts
    return newquerysource

# provides simple signalling mechanism for watchdog module
# based on emulating a minimal Watchdog 'EventHandler'
class QWatchdogAdaptor(QObject):
    
    watchdog = pyqtSignal()
    
    def __init__(self, filepath):
        super(QWatchdogAdaptor,self).__init__()
        self.filepath = filepath
    
    def dispatch(self, event):
        if(os.path.realpath(event.src_path) == os.path.realpath(self.filepath)):
            if event.event_type == 'modified':
                self.watchdog.emit()

def createjsbinder(frame, items):
        def jsbinder():
            for key, value in items.iteritems():
                frame.addToJavaScriptWindowObject(key,value)
        return jsbinder

# TODO CH, look into creating the 'editor' component
# by extending Viewer, using the load_filter as the query,
# then adding a callback editor adaptor which runs the serialised XML
# through the save_filter
# That would mean all the work to get imports to work, to auto-bind
# javascript names and xquery names, and to monitor file changes would
# be in common

class Viewer(QObject): #change back to object to view property errors

    def __init__(self, querypath=None, focuspath=None, xquerynames=None, javascriptnames=None, view=None):
        super(Viewer,self).__init__()
        self._focuspath = focuspath 
        self._querypath = querypath
        self._xquerynames = xquerynames if xquerynames != None else list()
        self._javascriptnames = javascriptnames if javascriptnames != None else dict()
        self.view = view if view != None else QWebView() # note: uses setter
        
        self._watches = dict()
        self._watchdogobserver = Observer()
        self._watchdogobserver.start() # starts monitoring thread

        for path in (focuspath,querypath):
            if path != None:
                self.registersource(path)        
        
    @property
    def javascriptnames(self):
        return self._javascriptnames

    @property
    def xquerynames(self):
        return self._xquerynames    
   
    @property
    def view(self):
        return self._view
    
    @view.setter
    def view(self, view):
        self._view = view
        if self._view != None:
            self._view.settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
            mainFrame = self._view.page().mainFrame()
            self.jsbinder = createjsbinder(mainFrame,self.javascriptnames)
            mainFrame.javaScriptWindowObjectCleared.connect(self.jsbinder)
  
    @property
    def focuspath(self):
        return os.path.realpath(self._focuspath) if self._focuspath != None else None

    @focuspath.setter
    def focuspath(self, focuspath):
        try:
            self.unregistersource(self._focuspath)
        except:
            pass
        self._focuspath = focuspath
        if self._focuspath != None:
            self.registersource(self._focuspath)
        self.render()

    @property
    def querypath(self):
        return os.path.realpath(self._querypath) if self._querypath != None else None

    @pyqtSlot(str)
    def loadquery(self, querypath):
        self.querypath = str(querypath)

    @querypath.setter
    def querypath(self, querypath):
        try:
            self.unregistersource(self._querypath)
        except:
            pass
        self._querypath = querypath
        if self._querypath != None:
            self.registersource(self._querypath)
        self.render()
        
    @property
    def querysource(self):
        try:
            oldstore = self.modulepathstore
        except:
            oldstore = list()
        newstore = list()
        querysource = inline_import_sources(self.querypath, newstore)
        # unsubscribe from old modules not loaded
        for unwatched in list(set(oldstore) - set(newstore)):
            self.unregistersource(unwatched)
        # subscribe to new modules now loaded
        for watched in list(set(newstore) - set(oldstore)):
            self.registersource(watched)            
        self.modulepathstore = newstore        
        return querysource
    
    
    @property
    def xmlbuffer(self):
        queryimpl = QXmlQuery(QXmlQuery.XQuery10)
        #push values in xquerynames
        for item in self.xquerynames:
            if len(item)==3 : # item has namespace
                (name,value,namespace) = item
                qname = QXmlName(queryimpl.namePool(), name, namespace)
            else:
                (name,value) = item
                qname = QXmlName(queryimpl.namePool(), name)
            qvalue = QXmlItem(value)
            queryimpl.bindVariable(qname,qvalue)
        #bind focus if available
        if(self.focuspath != None):
            queryimpl.setFocus(QUrl.fromLocalFile(self.focuspath))
        queryimpl.setQuery(self.querysource)

        buf = QBuffer()
        buf.open(QBuffer.ReadWrite)
        queryimpl.evaluateTo(buf)
        buf.close()
        data = buf.data()
        return data
        
    @property
    def mime(self):
        return "application/xhtml+xml"
    
    @property
    def baseurl(self):
        return QUrl.fromLocalFile(os.path.realpath(os.getcwd()) + os.sep)

    # Use to make a source file explicit so this view
    # will re-render when the file is updated
    def registersource(self, filepath):
        if filepath not in self._watches:
            adaptor = QWatchdogAdaptor(filepath)
            adaptor.watchdog.connect(self.refresh)
            self._watches[filepath] = self._watchdogobserver.schedule(adaptor, os.path.dirname(os.path.realpath(filepath)))

    def unregistersource(self, filepath):
        if filepath in self._matches:
            self._watchdogobserver.unschedule(self._matches[filepath])

    @pyqtSlot()
    def render(self):
        QWebSettings.clearMemoryCaches()
        try:
            mybuffer = self.xmlbuffer
            self.view.setContent(mybuffer, self.mime, self.baseurl)
        except Exception as e:
            self.view.setHtml( "Unexpected error:" + handle_except(e) )
            
    @pyqtSlot()
    def refresh(self):
        frame = self.view.page().mainFrame()
        
        pos = frame.scrollPosition()
        def updatescroll():
            frame.setScrollPosition(pos)
            frame.contentsSizeChanged.disconnect(updatescroll)
        frame.contentsSizeChanged.connect(updatescroll)
        
        self.render()


class Editor(Viewer):

    def __init__(self, *args, **kwargs):

        self.savefilterpath = kwargs.pop('savefilterpath' , 'xq/lib/editor_save.xq')

        kwargs.setdefault('querypath' , 'xq/lib/editor_load.xq')

        super(Editor, self).__init__(*args, **kwargs)
        
        self.javascriptnames['editor'] = self

    @pyqtSlot(str)
    def loadfocus(self, filepath):
        (filepath, headers) = urllib.urlretrieve(str(filepath))
        self.focuspath = filepath
    
    @pyqtSlot(str)
    def save(self, serialized, filepath=None):
        if filepath == None:
            filepath = self.focuspath
        f = open(filepath, 'w')
        savefilter = QXmlQuery(QXmlQuery.XQuery10)
        savefilter.setFocus(serialized)
        savefilter.setQuery(QUrl(os.path.realpath(self.savefilterpath)))
        result = savefilter.evaluateToString()
        result = result.toUtf8()
        f.write(result)

    @pyqtSlot(str)
    def autosave(self, serialized):
        self.save(serialized, self.focuspath + "~")