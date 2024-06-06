# Manual Tests

We haven't automated tests yet, so here are some manual test cases.
Test cases are written in cucumber syntax. Given When Then. These are abbreviated to just "G", "W", "T"


## Text Nodes
```
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

Remove empty nodes:
    G: I started editing a new node
    W: I end editing, with no text left in the node
    T: the node is not added, it is removed

Delete node (Backspace):
    G: I have a node
    W: I select the node and press "Backspace"
    T: the node is deleted

Delete node (Delete):
    G: I have a node
    W: I select the node and press "Delete"
    T: the node is deleted

Delete node (d):
    G: I have a node
    W: I select the node and press "d"
    T: the node is deleted

Delete node - connected edges:
    G: I have a node, with edges connected to it
    W: I select the node and press "Delete"
    T: the node is deleted, and the edges connected to it are also deleted
```

## Edges
```
Start drawing edge:
    G: There is a node
    W: I press "e" and click on that node
    T: A line is drawn between that node and my mouse. It should follow my mouse

Cancel Edge:
    G: I am drawing an edge (above)
    W: I press "e" or "Escape"
    T: The line I'm drawing should be cancelled

Finish drawing edge:
    G: I am drawing an edge (above)
    W: I left-click on any other node
    T: An edge should be drawn between the start and end nodes. The line should no longer follow my mouse

Move edges with nodes:
    G: I have drawn an edge between 2 nodes
    W: I move one of the nodes
    T: The edge should move too

Delete edge (Backspace):
    G: I have a edge
    W: I select the edge and press "Backspace"
    T: the edge is deleted

Delete edge (Delete):
    G: I have a edge
    W: I select the edge and press "Delete"
    T: the edge is deleted
```

## Pan
```
Panning:
    W: I click and drag with the right mouse button
    T: The canvas should pan

```
## Help
```
Expand:
    W: I click on the question mark in teh top right
    T: The help text opens

Minimize:
    G: The help text is open
    W: I click on the minimize button in the top right
    T: The help text closes
```