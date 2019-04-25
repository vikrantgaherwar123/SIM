const { app, BrowserWindow } = require('electron')

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1027, 
    height: 728,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/simpleInvoiceManagerWeb/assets/logo.png`,


    //for electron app run
    webPreferences: {
      allowEval: false, // This is the key!
  }
  })


  win.loadURL(`file://${__dirname}/dist/simpleInvoiceManagerWeb/index.html`)

  // win.loadFile('dist/simpleInvoiceManagerWeb/index.html')

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})