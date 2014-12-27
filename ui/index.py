import os,sys,glob
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

# Manages an updating view of an XQuery
class QueryDisplay(QObject):

    def __init__(self, focus, query, vardict={}, view=None):
        super(QueryDisplay,self).__init__()
        self.focus = focus
        self.query = query
        self.vardict = vardict
        self.view = view if view != None else QWebView()
    
    @pyqtSlot()
    def render(self):
        queryimpl = QXmlQuery(QXmlQuery.XQuery10)
        #bind variables
        for key in self.vardict:
            queryimpl.bindVariable(key,QXmlItem(self.vardict[key]))
        #bind focus if available
        if(self.focus != None):
            queryimpl.setFocus(self.focus)
        #load xquery
        queryimpl.setQuery(self.query)
        #push result of query to HTML viewer
        '''
        buf = QBuffer()
        buf.open(QBuffer.ReadWrite)
        queryimpl.evaluateTo(buf)
        self.view.setContent(buf.buffer(),"application/xhtml+xml")
        '''
        self.view.setHtml(queryimpl.evaluateToString())

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
                
                f = open("example_filtered.html", "w")
                f.write(buf.buffer())
                f.close()
                
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
    focus = None
    query = QUrl.fromLocalFile(queryfile)
    vardict = {
        'filepaths':htmlcsv
    }
    
    # create UI for rendering aggregate log data      
    navigator = QueryDisplay(focus,query,vardict,navView)
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