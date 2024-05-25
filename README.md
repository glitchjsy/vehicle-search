# Jersey Vehicle Search
A web app that scans number plates using your phones camera and looks up car information from [gov.je](https://vehicle-search.gov.je).

<img width="250px" src="https://github.com/glitchjsy/vehicle-search/assets/32024335/576974ca-92f2-42bb-a3dc-0b8eb0f4627e">

## Installation
This is not a complete guide and assumes you're running on ubuntu.

> **IMPORTANT**<br>
> You MUST connect to the site over https. This means you probably want to install the backend and site on a remote server

### Install dependencies
```bash
# install libtool m4 automake cmake & pkg-config
sudo apt-get install libtool m4 automake cmake pkg-config chromium-browser make unzip

# install opencv
sudo apt-get install libopencv-dev

# install liblog4cplus-dev, liblog4cplus-1.1-9 and build-essential:
sudo apt-get install liblog4cplus-1.1-9 liblog4cplus-dev build-essential
```

### Download & install leptonica 1.74.1
```bash
wget https://github.com/DanBloomberg/leptonica/archive/1.74.1.tar.gz

# unpack tarball and cd into leptonica directory
tar -xvzf 1.74.1.tar.gz
cd leptonica-1.74.1

# build leptonica
./autobuild
./configure
sudo make
sudo make install
```

### Download & install tesseract 3.0.5
```bash
$wget https://github.com/tesseract-ocr/tesseract/archive/3.05.02.tar.gz

# unpack tarball and cd into tesseract directory
tar -xvzf
cd tesseract-3.05.02/

# build tesseract
./autogen.sh
./configure --enable-debug LDFLAGS="-L/usr/local/lib" CFLAGS="-I/usr/local/include"
sudo make
sudo make install
sudo make install-langs
sudo ldconfig
```

### Install libcurl3
```bash
sudo add-apt-repository ppa:xapienz/curl34
sudo apt-get update
sudo apt-get install libcurl4 libcurl4-openssl-dev  
```

### Download & install openalpr
```bash
git clone https://github.com/openalpr/openalpr.git
cd openalpr/src 
mkdir build
cd build

# setup the compile environment
cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_INSTALL_SYSCONFDIR:PATH=/etc ..

# and compile the library
make && sudo make install
```

### Setup project
Once the above is done, complete the following:

1. Clone the repo
2. Run `npm install` in both the `backend` and `site` directories
3. In the `backend` directory, edit the `config.json` to set your desired port and set the chromium path 
4. In the `site` directory, edit the `src/App.ts` file to change `API_URL` to your backend server
5. Enter both the `site` and `backend` directories and run `npm start` in each directory respectively

## Notes
* It can be a bit tempermental. It uses the GB model from openalpr for reading number plates and it doesn't always work well with Jersey plates
* For some reason the uploaded images are blank. This didn't happen a few months ago when I last tested it, so for now I have hardcoded a number plate on the backend to allow demontrating the app

This is a test project and isn't intended to be released to the public. The site [here](https://vehicle-search.glitch.je) is provided as a demonstration.

## Backend API
If you just want to retrieve plate information as JSON, there is an API endpoint `/:plate`. [Here is an example](https://api-vehicle-search.glitch.je/J121551). 

The site is hosted as a demo and may be taken down at any time. If you would like to implement this yourself, see [the code](https://github.com/glitchjsy/vehicle-search/blob/master/backend/vehicle-search.js#L19).
