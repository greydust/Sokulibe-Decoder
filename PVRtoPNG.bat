@echo off
path %path%;"C:\Imagination\PowerVR_Graphics\PowerVR_Tools\PVRTexTool\CLI\Windows_x86_32"
for /f "usebackq tokens=*" %%d in (`dir /s /b ExtractedAssets\Texture2D\*.pvr`) do (
PVRTexToolCLI.exe -f PVRTC1_4 -i "%%d" -d "%%~dpnd.png"
del "%%~dpnd.pvr"
)