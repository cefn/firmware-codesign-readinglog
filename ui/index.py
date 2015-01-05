import sys,os,glob,urlparse,urllib
sys.path.append(os.path.realpath('py'))

from logx import Viewer,Editor,debug_trace

'''
from PyQt5 import uic
from PyQt5.QtWidgets import QApplication
'''
from PyQt4 import uic
from PyQt4.QtGui import QApplication

def path2url(path):
    return urlparse.urljoin(
      'file:', urllib.pathname2url(path))

def main():

    querypath = os.path.realpath("./xq/index.xq")
    
    sourcedir = os.path.realpath("../scripts/server/public/notes")

    sourcepaths = glob.glob(sourcedir + "/*.html")
    
    # for PyQt4
    sourceurls = ",".join([("file://" + path) for path in sourcepaths])
    
    # for PyQt5
    #sourceurls = ",".join([path2url(path) for path in sourcepaths])

    xquerynames = [
        ['sourceurls', sourceurls,'http://cefn.com/logx']
    ]

    javascriptnames = dict()

    # create application context
    app = QApplication(sys.argv)    
    ui = uic.loadUi('index.ui')
        
    editor = Editor(focuspath=None,view=ui.editView,javascriptnames=javascriptnames)
    viewer = Viewer(querypath=querypath,view=ui.navView,javascriptnames=javascriptnames,xquerynames=xquerynames)
    
    javascriptnames['editor']=editor
    javascriptnames['viewer']=viewer

    # subscribe viewer to refresh whenever source files refresh
    # implicitly bound through 'sourcepaths' xquery name
    for sourcepath in sourcepaths:
        viewer.registersource(sourcepath)
        
    ui.show()

    editor.focuspath = "example.html"
    
    viewer.render()
        
    sys.exit(app.exec_())
    
if __name__ == "__main__":
    main()