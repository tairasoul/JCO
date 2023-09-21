#include <iostream>
#include <Windows.h>
#include <filesystem>
#include <fstream>
#include <thread>

// thanks stackoverflow https://stackoverflow.com/questions/216823/how-to-trim-an-stdstring

const char* ws = " \t\n\r\f\v";

// trim from end of string (right)
inline std::string& rtrim(std::string& s, const char* t = ws)
{
    s.erase(s.find_last_not_of(t) + 1);
    return s;
}

using std::string;

string rootDir("C:/JCO/Main/data");

bool isConsoleHidden = false;

char* buf = nullptr;
size_t sz = 0;

HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
HWND consoleWindow = GetConsoleWindow();

//Tray icon code from stackoverflow and various other internet sources, I was unsure on how it worked.
LRESULT CALLBACK WndProc(HWND hWnd, UINT iMsg, WPARAM wParam, LPARAM lParam);
LPCWSTR lpszClass = L"__hidden__";

int traySystem() {
    HINSTANCE hInstance = GetModuleHandle(nullptr);

    WNDCLASS wc;
    HWND hWnd;
    MSG msg;

    wc.cbClsExtra = 0;
    wc.cbWndExtra = 0;
    wc.hbrBackground = nullptr;
    wc.hCursor = nullptr;
    wc.hIcon = nullptr;
    wc.hInstance = hInstance;
    wc.lpfnWndProc = WndProc;
    wc.lpszClassName = lpszClass;
    wc.lpszMenuName = nullptr;
    wc.style = 0;
    RegisterClass(&wc);

    hWnd = CreateWindow(lpszClass, lpszClass, WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, nullptr, nullptr, hInstance, nullptr);

    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return static_cast<int>(msg.wParam);
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT iMsg, WPARAM wParam, LPARAM lParam) {
    static NOTIFYICONDATA nid;
    std::ofstream isHiddenFile;

    switch (iMsg) {
    case WM_CREATE:
        std::memset(&nid, 0, sizeof(nid));
        nid.cbSize = sizeof(nid);
        nid.hWnd = hWnd;
        nid.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP | NIF_INFO;
        nid.uCallbackMessage = WM_APP + 1;
        nid.hIcon = (HICON)LoadImageA(NULL, (rootDir + "\\icon.ico").c_str(), IMAGE_ICON, 0, 0, LR_LOADFROMFILE | LR_SHARED);
        memcpy_s(nid.szTip, sizeof(nid.szTip), L"JCO <3\nClick to toggle console", sizeof(wchar_t[31]));
        Shell_NotifyIcon(NIM_ADD, &nid);
        return 0;
    case WM_APP + 1:
        switch (lParam) {
        case WM_LBUTTONDBLCLK:
            if (isConsoleHidden) {
                ShowWindow(consoleWindow, SW_SHOW);
                isConsoleHidden = false;
                isHiddenFile.open(rootDir + "\\isHidden.jco");
                isHiddenFile << "f";
                isHiddenFile.close();
            }
            else {
                ShowWindow(consoleWindow, SW_HIDE);
                isConsoleHidden = true;
                isHiddenFile.open(rootDir + "\\isHidden.jco");
                isHiddenFile << "t";
                isHiddenFile.close();
            }
            break;
        case WM_LBUTTONDOWN:
            if (isConsoleHidden) {
                ShowWindow(consoleWindow, SW_SHOW);
                isConsoleHidden = false;
                isHiddenFile.open(rootDir + "\\isHidden.jco");
                isHiddenFile << "f";
                isHiddenFile.close();
            }
            else {
                ShowWindow(consoleWindow, SW_HIDE);
                isConsoleHidden = true;
                isHiddenFile.open(rootDir + "\\isHidden.jco");
                isHiddenFile << "t";
                isHiddenFile.close();
            }
            break;
        }
        break;
    case WM_DESTROY:
        Shell_NotifyIcon(NIM_DELETE, &nid);
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hWnd, iMsg, wParam, lParam);
}

int main(int argc, char** argv) {
    SetConsoleTitle(L"JCO");
    if (std::filesystem::exists(rootDir + "\\isHidden.jco")) {
        std::ifstream hidden(rootDir + "\\isHidden.jco");
        hidden.seekg(0, std::ios::end);
        size_t size = hidden.tellg();
        string buffer(size, ' ');
        hidden.seekg(0);
        hidden.read(&buffer[0], size);
        isConsoleHidden = (rtrim(buffer).starts_with("t"));
    }

    //Handle Hidden Value
    if (isConsoleHidden) {
        ShowWindow(consoleWindow, SW_HIDE);
    }
    else {
        ShowWindow(consoleWindow, SW_SHOW);
    }

    SetWindowLong(consoleWindow, GWL_STYLE, GetWindowLong(consoleWindow, GWL_STYLE) & ~WS_MINIMIZEBOX);
    SetWindowLong(consoleWindow, GWL_STYLE, GetWindowLong(consoleWindow, GWL_STYLE) & ~WS_MAXIMIZEBOX);

    std::thread t1(traySystem);

    while (true) {
        const auto exitCode = system("node C:/JCO/Main/main.js");
        if (exitCode != 0) {
            std::cout << "JCO has crashed. Restarting in 5 seconds.";
            std::this_thread::sleep_for(std::chrono::seconds(5));
            system("cls");
        }
        else {
            std::this_thread::sleep_for(std::chrono::seconds(2));
            STARTUPINFOA si;
            PROCESS_INFORMATION pi;

            ZeroMemory(&si, sizeof(si));
            si.cb = sizeof(si);
            ZeroMemory(&pi, sizeof(pi));

            std::string bat = "C:/JCO/Installer/run.bat";

            // Start the child process. 
            CreateProcessA(bat.c_str(),   // No module name (use command line)
                NULL,        // Command line
                NULL,           // Process handle not inheritable
                NULL,           // Thread handle not inheritable
                FALSE,          // Set handle inheritance to FALSE
                0,              // No creation flags
                NULL,           // Use parent's environment block
                NULL,           // Use parent's starting directory 
                &si,            // Pointer to STARTUPINFO structure
                &pi);           // Pointer to PROCESS_INFORMATION structure

            // Close process and thread handles. 
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            exit(0);
        }
    }
}
