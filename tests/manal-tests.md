# Manual Tests

We haven't automated tests yet, so here are some manual test cases.
Test cases are written in cucumber syntax. Given When Then. These are abbreviated to just "G", "W", "T"

## Pan
Panning:
    W: I click and drag with the right mouse button
    T: The canvas should pan

## Text Nodes
Enter edit mode:
    W: I double-click on an empty space
    T: I enter "edit-text" mode

Exit exit-mode(esc):
    G: I'm in "edit-text" mode
    W: I hit "Esc"
    T: I leave "edit-text" mode

Exit edit-mode(click):
    G: I'm in "edit-text" mode
    W: I click anywhere outside the node
    T: I leave "edit-text" mode

Create text node:
    G: I'm in "edit-text" mode, and I've typed in some text
    W: I exit edit-mode (via esc or clicking)
    T: The input is converted to a text node. Text with a rectangle around it.

Move text nodes:
    G: There's a text node
    W: I click and drag it
    T: It moves

Edit text node:
    G: There's a text node
    W: I double-click it
    T: I enter edit-mode on that text node

