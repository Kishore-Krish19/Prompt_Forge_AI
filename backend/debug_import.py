import traceback
import sys

try:
    print("Attempting to import app from main...")
    from main import app
    print("✅ App imported successfully!")
except Exception as e:
    print("❌ Import failed with traceback:")
    traceback.print_exc()
    sys.exit(1)
 Weston
