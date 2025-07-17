#!/bin/bash

echo "🚀 Building BlackBox AI APK..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}📋 Checking requirements...${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}❌ npx is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Install dependencies if needed
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Install Capacitor if not present
    if ! npm list @capacitor/core > /dev/null 2>&1; then
        echo -e "${YELLOW}📱 Installing Capacitor...${NC}"
        npm install @capacitor/core @capacitor/android
    fi
    
    if ! command -v cap &> /dev/null; then
        echo -e "${YELLOW}🔧 Installing Capacitor CLI...${NC}"
        npm install -g @capacitor/cli
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Build web application
build_web_app() {
    echo -e "${BLUE}🏗️ Building web application...${NC}"
    
    # Clean previous build
    rm -rf out/
    
    # Build for production
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Web build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Web application built successfully${NC}"
}

# Setup Capacitor
setup_capacitor() {
    echo -e "${BLUE}⚙️ Setting up Capacitor...${NC}"
    
    # Initialize Capacitor if not already done
    if [ ! -f "capacitor.config.ts" ]; then
        npx cap init "BlackBox AI" "com.rafade31.blackboxai"
    fi
    
    # Add Android platform if not present
    if [ ! -d "android" ]; then
        echo -e "${YELLOW}📱 Adding Android platform...${NC}"
        npx cap add android
    fi
    
    echo -e "${GREEN}✅ Capacitor setup complete${NC}"
}

# Sync and build APK
build_apk() {
    echo -e "${BLUE}📱 Building APK...${NC}"
    
    # Copy web assets to native project
    npx cap copy android
    
    # Sync Capacitor
    npx cap sync android
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        exit 1
    fi
    
    # Build APK using Gradle
    if [ -d "android" ]; then
        cd android
        
        # Make gradlew executable
        chmod +x gradlew
        
        # Build debug APK
        echo -e "${YELLOW}🔨 Building debug APK...${NC}"
        ./gradlew assembleDebug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ APK built successfully!${NC}"
            echo -e "${BLUE}📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
            
            # Copy APK to root directory for easy access
            cp app/build/outputs/apk/debug/app-debug.apk ../blackbox-ai.apk
            cd ..
            echo -e "${GREEN}📁 APK copied to: blackbox-ai.apk${NC}"
        else
            echo -e "${RED}❌ APK build failed${NC}"
            cd ..
            exit 1
        fi
    else
        echo -e "${RED}❌ Android directory not found${NC}"
        exit 1
    fi
}

# Install APK on connected device
install_apk() {
    echo -e "${BLUE}📲 Installing APK on device...${NC}"
    
    if command -v adb &> /dev/null; then
        if adb devices | grep -q "device$"; then
            adb install blackbox-ai.apk
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ APK installed successfully!${NC}"
            else
                echo -e "${YELLOW}⚠️ APK installation failed. You can install manually.${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ No Android device connected via USB${NC}"
            echo -e "${BLUE}💡 You can install the APK manually: blackbox-ai.apk${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ ADB not found. You can install the APK manually: blackbox-ai.apk${NC}"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}🎯 BlackBox AI APK Builder${NC}"
    echo -e "${BLUE}Building native Android app from your web application...${NC}"
    echo ""
    
    check_requirements
    install_dependencies
    build_web_app
    setup_capacitor
    build_apk
    
    echo ""
    echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Your BlackBox AI APK is ready!${NC}"
    echo -e "${BLUE}📱 APK file: blackbox-ai.apk${NC}"
    echo -e "${BLUE}📂 Full path: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "${BLUE}1. Transfer blackbox-ai.apk to your Android device${NC}"
    echo -e "${BLUE}2. Enable 'Install from unknown sources' in Android settings${NC}"
    echo -e "${BLUE}3. Install the APK by tapping on it${NC}"
    echo -e "${BLUE}4. Enjoy your AI coding assistant on Android!${NC}"
    echo ""
    
    # Ask if user wants to install on connected device
    read -p "$(echo -e ${YELLOW}Would you like to install on a connected Android device? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_apk
    fi
    
    echo -e "${GREEN}🚀 Your BlackBox AI is now a native Android app!${NC}"
}

# Run main function
main "$@"