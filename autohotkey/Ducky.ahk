#Requires AutoHotkey v2.0

; Right Alt -> Down Arrow
RAlt::Send "{Down}"

; Right Windows -> Left Arrow
RWin::Send "{Left}"

; Right Control -> Right Arrow
RControl::Send "{Right}"

; Right Shift -> Up Arrow (when pressed alone)
RShift up::
{
    if (A_PriorKey = "RShift")
        Send "{Up}"
}

; Right Shift + Delete -> Shift+Delete
>+Del::Send "{Shift Down}{Del}{Shift Up}"
