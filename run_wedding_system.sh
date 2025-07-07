#!/bin/bash
echo "🎉 Starting Wedding Planning System..."
echo ""
echo "Choose your method:"
echo "1. Python 3 Server"
echo "2. Python 2 Server" 
echo "3. PHP Server"
echo "4. Just open index.html"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "Starting Python 3 server..."
        python3 -m http.server 8000 --bind 0.0.0.0
        ;;
    2)
        echo "Starting Python 2 server..."
        python -m SimpleHTTPServer 8000
        ;;
    3)
        echo "Starting PHP server..."
        php -S localhost:8000
        ;;
    4)
        echo "Opening index.html in default browser..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open index.html
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            open index.html
        elif [[ "$OSTYPE" == "msys" ]]; then
            start index.html
        fi
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
