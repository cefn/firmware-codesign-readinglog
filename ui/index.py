import os,sys,glob,re
from PyQt4 import QtCore, QtGui, uic
from PyQt4.QtGui import QApplication
from PyQt4.QtCore import QObject,pyqtSlot,pyqtSignal,QUrl,QBuffer,QIODevice
from PyQt4.QtWebKit import QWebView,QWebSettings
from PyQt4.QtXmlPatterns import QXmlItem,QXmlName,QXmlQuery

from watchdog.observers import Observer

def debug_trace():
  '''Set a tracepoint in the Python debugger that works with Qt'''
  from PyQt4.QtCore import pyqtRemoveInputHook
  from pdb import set_trace
  pyqtRemoveInputHook()
  set_trace()
  
# hack to work around Qt's refusal to import XQuery modules
# https://bugreports.qt-project.org/browse/QTBUG-43414
# looks for a module import pattern in the XQuery source, just copies
# selected code from the imported file
# currently, just function definitions
def xquery_import_workaround(querypath):

    
    # definitions of patterns used to process query and imported files
    import_pattern = 'import module namespace ([A-Za-z]+)="([^"]+)" at "([^"]+)";'
    declare_pattern = '(declare function.*?};|declare variable [^;]+;)'
    
    # get the original query and separate out the imports in it
    queryfile = open(querypath,'r')
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
        
        modulefile = open(modulepath,'r')
        modulesource = modulefile.read()
        modulefile.close()
        modulefunctionsplit = re.findall(declare_pattern,modulesource, re.MULTILINE|re.DOTALL)

        newquerysplit.append("\n\n".join(modulefunctionsplit) + "\n\n")
        newquerysplit.append(following)

    newquerysource = ''.join(newquerysplit) # rejoin all the string parts
    return newquerysource

# Manages an updating view of an XQuery
class QueryDisplay(QObject):

    def __init__(self, focuspath, querypath, varlist=[], view=None):
        super(QueryDisplay,self).__init__()
        self.focuspath = focuspath
        self.querypath = querypath
        self.varlist = varlist
        self.view = view if view != None else QWebView()
    
    @pyqtSlot()
    def render(self):
        queryimpl = QXmlQuery(QXmlQuery.XQuery10)
        #bind variables
        for item in self.varlist:
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
        #load xquery
        querysource = xquery_import_workaround(self.querypath)
        queryimpl.setQuery(querysource)

        
        #push result of query to HTML viewer
        '''
        buf = QBuffer()
        buf.open(QBuffer.ReadWrite)
        queryimpl.evaluateTo(buf)
        self.view.setContent(buf.buffer(),"application/xhtml+xml")
        self.view.setHtml(queryimpl.evaluateToString())
        '''
        base_url = QUrl.fromLocalFile(os.path.dirname(self.querypath) + os.sep)
        buf = QBuffer()
        buf.open(QBuffer.ReadWrite)
        queryimpl.evaluateTo(buf)        
        self.view.setContent(buf.buffer(), "application/xhtml+xml", base_url)

# TODO promote functionality for both nav and edit into common superclass        
class QEditorAdaptor(QObject):
    
    def __init__(self,view=None, load_filter_path='lib/xq/load_template.xq', save_filter_path='lib/xq/save_template.xq'):
        super(QEditorAdaptor,self).__init__()
        self.view = view if view != None else QWebView()
        self.view.settings().setAttribute(QWebSettings.LocalContentCanAccessFileUrls, True)
        self.view.settings().setAttribute(QWebSettings.LocalContentCanAccessRemoteUrls, True)
        self.view.settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
        self.load_filter_path = os.path.realpath(load_filter_path)
        self.save_filter_path = os.path.realpath(save_filter_path)
        self.filepath = None

    # loads the specified file into the editor window
    # TODO CH check for unsaved changes
    # an alternative implementation of javascript injection
    # could be (from http://stackoverflow.com/questions/22211584/using-document-head-appendchild-to-append-a-script-tag-that-has-an-src-attribu)...
    # var sc = document.createElement("script");
    # sc.setAttribute("src", "https://getfirebug.com/firebug-lite.js");
    # sc.setAttribute("type", "text/javascript");
    # document.head.appendChild(sc);
    @pyqtSlot(str)
    def load(self, filepath, force=False):
        if(filepath != self.filepath or force):
            self.filepath = filepath
            # check there is a file being sent to editor
            if filepath != None:
                # update filepath and push XQuery-filtered version to view
                # this filter should add any javascript or styling needed
                load_filter = QXmlQuery(QXmlQuery.XQuery10)
                load_filter.setFocus(QUrl.fromLocalFile(filepath))
                load_filter.setQuery(QUrl.fromLocalFile(self.load_filter_path))

                base_url = QUrl.fromLocalFile(os.path.dirname(filepath) + os.sep)
                
                buf = QBuffer()
                buf.open(QBuffer.ReadWrite)
                load_filter.evaluateTo(buf)
                                
                self.view.setContent(buf.buffer(), "application/xhtml+xml", base_url)
                #self.view.setHtml(load_filter.evaluateToString(), base_url)
                self.view.page().mainFrame().addToJavaScriptWindowObject("editor", self)
                
            else:
                self.view.setHtml('')

    # call this to trigger load of a specific file
    # in a specific (xpath) location
    @pyqtSlot(str,int)
    def edit(self, filepath, xpath='.//h1[1]//text()[1]'):
        self.load(filepath)
        # trigger contentEditable toggle and
        # selection (cursor) focus by xpath

    
    # call this to save an xpath file
    @pyqtSlot(str)
    def save(self, serialized, filepath=None):
        if filepath == None:
            filepath = self.filepath
        f = open(filepath, 'w')
        # this filter should remove any javascript and simplify the html
        # back to basics (should whitelist elements, attributes, text etc.)
        save_filter = QXmlQuery(QXmlQuery.XQuery10)
        save_filter.setFocus(serialized)
        save_filter.setQuery(QUrl(self.save_filter_path))
        result = save_filter.evaluateToString()
        #debug_trace()
        result = result.toUtf8()
        f.write(result)

    # call this to save an xpath file
    @pyqtSlot(str)
    def autosave(self, serialized):
        self.save(serialized, self.filepath + "~")

# provides simple signalling mechanism for watchdog module
# based on emulating a minimal Watchdog 'EventHandler'
class QWatchdogAdaptor(QObject):
    
    watchdog_signal = pyqtSignal()
    
    def __init__(self):
        super(QWatchdogAdaptor,self).__init__()
    
    def dispatch(self, event):
        self.watchdog_signal.emit()

def main():

    # create application context
    app = QApplication(sys.argv)
    
    ui = uic.loadUi('index.ui')
    
    editView = ui.editView
    
    navView = ui.navView
    
    # try to get values from command line, or use fallbacks    
    datadir = sys.argv[1] if len(sys.argv) > 1 else "../scripts/server/public/notes"
    queryfile = sys.argv[2] if len(sys.argv) > 2 else "./index.xq"
    
    # sanitise paths
    datadir = os.path.realpath(datadir)
    queryfile = os.path.realpath(queryfile)
    
    # create a comma separated list of all htmlfiles in the datapath
    htmlcsv = ",".join([("file:///" + path) for path in glob.glob(datadir + "/*.html")])

    # prepare values for XQuery view    
    focusfile = None
    varlist = [
        ['filepaths', htmlcsv,'http://cefn.com/readinglog/log']
    ]
    
    # create UI for rendering aggregate log data      
    navigator = QueryDisplay(focusfile,queryfile,varlist,navView)
    # create UI for editing specific log entry
    editor = QEditorAdaptor(editView)
        
    # generate Qt signals on watchdog filesystem events
    observer = Observer()
    adaptor = QWatchdogAdaptor()
    observer.schedule(adaptor, datadir)
    observer.schedule(adaptor, os.path.dirname(queryfile))
    observer.start()
    adaptor.watchdog_signal.connect(navigator.render)

    ui.show()
    navigator.render()
    editor.edit(os.path.realpath("example.html"))
    
    sys.exit(app.exec_())
    
if __name__ == "__main__":
    main()