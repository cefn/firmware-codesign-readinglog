#!/usr/bin/python

import sys,os,glob,urlparse,urllib,subprocess

def setcwd():
    realpath = os.path.realpath(sys.argv[0])
    dname = os.path.dirname(realpath)
    os.chdir(dname)

# sets working directory based on path to index.py
setcwd()

# loads local python modules, relative to index.py
sys.path.append(os.path.realpath('py'))

from logx import Viewer,Editor,debug_trace

'''
from PyQt5 import uic
from PyQt5.QtWidgets import QApplication
'''
from PyQt4 import uic
from PyQt4.QtGui import QApplication
from PyQt4.QtCore import QObject,pyqtSlot

notesdir = "../notes"
pdfdir = "../papers"
startquery = "./xq/index.xq"

class PdfAdaptor(QObject):

    @pyqtSlot(str)
    def loadid(self, pdfid):
        pdfid = str(pdfid)
        pdfpath = pdfdir + os.sep + pdfid + '.pdf'
        self.loadpdf(pdfpath)
    
    @pyqtSlot(str)
    def loadpdf(self, pdfpath):
        pdfpath = str(pdfpath)
        pdfpath = os.path.realpath(pdfpath)
        subprocess.Popen(['xdg-open', pdfpath])

def path2url(path):
    return urlparse.urljoin(
      'file:', urllib.pathname2url(path))

def main(argv):
    
    querypath = os.path.realpath(startquery)
    
    sourcedir = os.path.realpath(notesdir)

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
    pdf = PdfAdaptor()
    
    javascriptnames['editor']=editor
    javascriptnames['viewer']=viewer
    javascriptnames['pdf']=pdf

    # subscribe viewer to refresh whenever source files refresh
    # implicitly bound through 'sourcepaths' xquery name
    for sourcepath in sourcepaths:
        viewer.registersource(sourcepath)
        
    ui.show()
        
    # edit a notes file, if specified
    if len(argv) > 0:
        editor.focuspath = os.path.realpath(argv[0])

    # load the view
    viewer.render()
        
    sys.exit(app.exec_())
    
if __name__ == "__main__":
    main(sys.argv[1:])