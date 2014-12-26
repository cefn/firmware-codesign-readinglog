from PyQt4.QtCore import QObject,pyqtSlot,QUrl,QBuffer,QFile,QString
from PyQt4.QtGui import QApplication
from PyQt4.QtWebKit import QWebView,QWebSettings
import os,sys

def debug_trace():
  '''Set a tracepoint in the Python debugger that works with Qt'''
  from PyQt4.QtCore import pyqtRemoveInputHook
  from pdb import set_trace
  pyqtRemoveInputHook()
  set_trace()

filepath = "test.html"

# Object which exposes a slot to QWebView
# for the serialized HTML to be inserted
class Editor(QObject):
  
  def __init__(self):
    super(QObject,self).__init__()
    
  #@pyqtSlot("QVariantList")
  @pyqtSlot(str)
  def save(self, serialized):
  
    f = open("saved_" + filepath, 'w')
    f.write(serialized.toUtf8())
    f.close()

# Routine to create a Webview, load it and have
# javascript pass back the contents of the loaded page
# as an XML Serialized string
def main():

  app = QApplication(sys.argv)
  editor = Editor()

  view = QWebView()  
  view.settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
  view.show()

  # function which injects editor object with (save slot) on page load
  def bind_editor():
    view.page().mainFrame().addToJavaScriptWindowObject("editor", editor)
  # bind function to 'new page' event
  view.page().mainFrame().javaScriptWindowObjectCleared.connect(bind_editor)


  # figure out base_url from file path
  base_url = QUrl.fromLocalFile(os.path.dirname(filepath) + os.sep)

  # open file as a stream (required because of signature of setContent,
  # which allows Mime-type specification, but requires a byte array)
  stream = QFile(filepath)
  stream.open(QFile.ReadOnly)
  
  view.setContent(stream.readAll(), "application/xhtml+xml", base_url)
  stream.close()
    
  sys.exit(app.exec_())
  
   
if __name__ == "__main__":
  main()