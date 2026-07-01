import subprocess
import sys
import os
import shutil

def main():
    babel_js = os.path.abspath(sys.argv[1])
    src_file = os.path.abspath(sys.argv[2])
    out_file = os.path.abspath(sys.argv[3])
    config_file = os.path.abspath(sys.argv[4])
    
    # If the file is in test_runner, skip compilation and copy directly
    normalized_path = src_file.replace("\\", "/")
    if "test_runner" in normalized_path:
        # Create destination directory if it doesn't exist
        os.makedirs(os.path.dirname(out_file), exist_ok=True)
        shutil.copy2(src_file, out_file)
        sys.exit(0)
        
    # Dynamically find the absolute path to node_modules relative to babel_js
    node_modules_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(babel_js))))
    
    # Configure the environment with NODE_PATH pointing to node_modules
    env = os.environ.copy()
    if "NODE_PATH" in env:
        env["NODE_PATH"] = node_modules_dir + os.pathsep + env["NODE_PATH"]
    else:
        env["NODE_PATH"] = node_modules_dir
        
    # Run node babel_js src_file --out-file out_file --config-file config_file --source-type script
    res = subprocess.run([
        "node",
        babel_js,
        src_file,
        "--out-file",
        out_file,
        "--config-file",
        config_file,
        "--source-type",
        "script"
    ], env=env, shell=True)
    
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
