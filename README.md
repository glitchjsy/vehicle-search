# Vehicle Search
A web app that allows you to scan number plates using your phones camera and looks up car information from gov.je.

## Compiling
This is not a complete guide and assumes you're running on Ubuntu. Better instructions will follow.

### OpenALPR
Compile OpenALPR

TODO: Java Bindings Below
1. Clone the repo `https://github.com/openalpr/openalpr`
2. Go to `src/bindings/java` 
3. Edit the `make.sh` file and replace with the following contents, making sure to replace `OPENALPR_INCLUDE_DIR` and `OPENALPR_LIB_DIR` as needed:
```bash
#!/bin/sh

OPENALPR_INCLUDE_DIR=/root/openalpr/src/openalpr
OPENALPR_LIB_DIR=/root/openalpr/src/openalpr
JAVA_PATH=/usr/lib/jvm/java-1.17.0-openjdk-amd64

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:.:${OPENALPR_LIB_DIR}
# Compile java
javac -Xlint:unchecked src/com/openalpr/jni/json/*.java src/com/openalpr/jni/*.java  src/Main.java

# Create native header from Alpr java file
javac -Xlint:unchecked src/com/openalpr/jni/json/*.java src/com/openalpr/jni/*.java src/Main.java

# Compile/link native interface
g++ -Wall -L${OPENALPR_LIB_DIR} -I${JAVA_PATH}/include/ -I${JAVA_PATH}/include/linux -I${OPENALPR_INCLUDE_DIR} -shared -fPIC -o libopenalprjni.so openalprjni.cpp -lopenalpr

# Test
java -classpath src Main 
```
4. TODO