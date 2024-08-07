# Manual Tests

We haven't automated tests yet, so here are some manual test cases.
Test cases are written in cucumber syntax. Given When Then. These are abbreviated to just "G", "W", "T"

## Version
```
Version number
    G: I go to the homepage
    T: I should see the app version in teh bottom left
```

## Login
```
Skip login:
    G: I am on the homepage, not logged in
    W: I click "Start Mapping"
    T: I go directly to the canvas

Sign in with google:
    G: I am not logged in
    W: I click "Sign in with google"
    T: I am signed in

Sign out: 
    G: I am signed in
    W: I hit "sign out"
    T: The site returns to the "signed-out" state

My Files:
    G: I am logged in, on the homepage
    T: I see the button "Go to My Files"
```

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

Cancel Edge (click):
    G: I am drawing an edge (above)
    W: I click on empty space
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

Delete edge (d):
    G: I have a edge
    W: I select the edge and press "d"
    T: the edge is deleted

Label edge:
    G: I have an edge
    W: I double click on the edge
    T: I enter 'edit-text' mode and can start typing.

Finish label edge (click):
    G: I an editing the label of an edge
    W: I click outside the label
    T: I exit editing, and the label is rendered on the edge

Finish label edge (Esc):
    G: I an editing the label of an edge
    W: I press 'Escape'
    T: I exit editing, and the label is rendered on the edge

Update label edge:
    G: I have an edge with an existing label
    W: I double click the arrow, or the text
    T: I enter 'edit-text' mode and can start typing. The exiting text should be pre-loaded
```

## Pan
```
Panning:
    W: I right-click and drag 
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


## Groups
```
Move group of nodes:
    G: there are many nodes
    W: I click and drag to select many, then move
    T: All the nodes move

Move group of with edges:
    G: there are many nodes, with edges
    W: I click and drag to select many, then move
    T: All the nodes and edges move

Move group of with edges (partial):
    G: there are many nodes, with edges
    W: I click and drag to select some nodes (not not all connected nodes)
    T: The edges to non-selected nodes also update
```


## Persistence
Loading from storage:
    G: I have drawn some nodes and edges
    W: I reload the page
    T: They are still there

'mouse:up' bug:
    G: I have refershed the page, and loaded some nodes from storage
    W: AS MY FIRST ACTIION, I move a node
    T: Edge edit still works, panning still works

    This was a bug triggered by deleting an IText node from within an object:modified callback
    For some reason, if you do that, the mouse:up event stops working. I fixed it by switching IText nodes
    with Text nodes when you're not actually editing.


## Title
Setting title:
    G: I am on the canvas
    W: I click on the title
    T: I can edit it

Persisting title:
    G: I have set a title
    W: I reload the page
    T: The title is still there


## Save / Load
Save to file:
    G: I have drawn some nodes and edges
    W: I click on the save icon
    T: A file is downloaded `${title}.mapo`

Load from file:
    G: I have some other drawing open
    W: I click on the load icon, and select a .mapo file
    T: That drawing overrides the one I had
    T: The title is updated to fit what it was when that file was saved (may not actually match the filename on the FS)


## Save / Load to Profile

No files:
    G: I have logged in
    G: I have no files
    W: I go to my files
    T: I see the text "no files found...."

Load files from profile:
    G: I have logged in
    W: I go to my files
    T: I see my files

Open files from profile:
    G: I am logged in, on my files page
    W: I click on one file
    T: I see the contents of that file
    W: I go back and click on another file
    T: I see the contents of that file

Create new file:
    G: I am logged in, on my files page
    W: I click on "New MindMap"
    T: I see a blank canvas

    W: I click save
    T: My browser makes a POST request, and creates a new file

Update file:
    G: I have openned an existing file
    W: I click save
    T: My browser makes a PATCH request, to update the existing file

Update brand new file:
    G: I have clicked on "New Mindmap"
    W: I click save the first time
    T: My browser makes a POST request
    W: I click save the second time
    T: My browser makes a PATCH request

Delete file:
    G: I am logged in, on the "My files" page
    W: I click on the trashcan button
    T: My brwoser makes a DELETE request
    T: THe file dissapears

Rename a file (failing):
    G: I am logged in, and have openned an existing file
    W: I rename the file, and click "save"
    T: My browser makes a PATCH request and updates the name of the existing file

    W: I go back to "My files"
    T: I should see the file has been renamed, not adding a new file


## Bugs

```
Duplicate toolbar event listeners:
    G: I have openned the canvas, then left to "my-file", then went back to the canvsa
    W: I press 't'
    T: the text-node tool is selected
```


## IText Editing functionality

Mouse Controls (select):
    G: I am editing an itext (in a text box)
    W: I click on the text bos with my mouse
    T: the cursor updates to where I clicked

Mouse Controls (drag):
    G: I am editing an itext (in a text box)
    W: I click and drag
    T: I can select a section of text

Tab to increment:
    G: I am editing an itext (in a text box)
    W: I select a single position, and press tab
    T: The line I'm on moves forward 4 spaces

Tab to increment (multi-line):
    G: I am editing an itext (in a text box)
    W: I click and drag to select many lines, then press tab
    T: All lines should be incremented
    T: My cursor should still be highligting the previously-selected text (look for slight errors in the position)

Tab to decrement:
    G: I am editing an itext (in a text box), and I"m on a line with prepended spaces
    W: I press Shift+Tab
    T: The line I'm on moves back 4 spaces

Tab to decrement less than 4:
    G: I am editing an itext (in a text box), and I"m on a line with prepended spaces (but < 4)
    W: I press Shift+Tab
    T: The line I'm on moves back up to 4 spaces, but not more

Tab to decrement (multi-line):
    G: I am editing an itext (in a text box)
    W: I click and drag to select many lines, then press Shift+tab
    T: All lines in selection should move back 4 spaces
    T: My cursor should still be highligting the previously-selected text (look for slight errors in the position)