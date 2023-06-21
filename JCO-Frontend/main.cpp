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

void NodeThread() {
    system("node C:/JCO/Main/main.js");
}

int main(int argc, char** argv) {


    //Handle Hidden Value
    if (isConsoleHidden) {
        ShowWindow(consoleWindow, SW_HIDE);
    }
    else {
        ShowWindow(consoleWindow, SW_SHOW);
    }

    SetWindowLong(consoleWindow, GWL_STYLE, GetWindowLong(consoleWindow, GWL_STYLE) & ~WS_MINIMIZEBOX);
    SetWindowLong(consoleWindow, GWL_STYLE, GetWindowLong(consoleWindow, GWL_STYLE) & ~WS_MAXIMIZEBOX);
    EnableMenuItem(GetSystemMenu(consoleWindow, FALSE), SC_CLOSE, MF_BYCOMMAND | MF_DISABLED | MF_GRAYED);

    std::thread t1(NodeThread);

    while (true) {
        std::ifstream isHidden("C:/JCO/Main/data/isHidden.jco");
        std::string contents((std::istreambuf_iterator<char>(isHidden)),
            (std::istreambuf_iterator<char>()));
        if (rtrim(contents) == "t") {
            ShowWindow(consoleWindow, SW_HIDE);
        }
        else {
            ShowWindow(consoleWindow, SW_SHOW);
        }
    }
}
