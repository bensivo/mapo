# Manual Tests

We haven't automated tests yet, so here are some manual test cases.
Test cases are written in cucumber syntax. Given When Then. These are abbreviated to just "G", "W", "T"

## Version
```
(Automated) Version number
    G: I go to the homepage
    T: I should see the app version in teh bottom left
```

## Login
```
(Automated) Skip login:
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
(Automated) Enter edit mode:
    W: I double-click on an empty space
    T: I enter "edit-text" mode

(Automated) Exit exit-mode(esc):
    G: I'm in "edit-text" mode
    W: I hit "Esc"
    T: I leave "edit-text" mode

(Automated) Exit edit-mode(click):
    G: I'm in "edit-text" mode
    W: I click anywhere outside the node
    T: I leave "edit-text" mode

(Automated) Create text node:
    G: I'm in "edit-text" mode, and I've typed in some text
    W: I exit edit-mode (via esc or clicking)
    T: The input is converted to a text node. Text with a rectangle around it.

(Automated) Move text nodes:
    G: There's a text node
    W: I click and drag it
    T: It moves

(Automated) Edit text node:
    G: There's a text node
    W: I double-click it
    T: I enter edit-mode on that text node

(Automated) Remove empty nodes:
    G: I started editing a new node
    W: I end editing, with no text left in the node
    T: the node is not added, it is removed

(Automated) Delete node (Backspace):
    G: I have a node
    W: I select the node and press "Backspace"
    
    T: the node is deleted

(Automated) Delete node (Delete):
    G: I have a node
    W: I select the node and press "Delete"
    T: the node is deleted

(Automated) Delete node (d):
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
(Automated) Start drawing edge:
    G: There is a node
    W: I press "e" and click on that node
    T: A line is drawn between that node and my mouse. It should follow my mouse

(Automated) Cancel Edge:
    G: I am drawing an edge (above)
    W: I press "e" or "Escape"
    T: The line I'm drawing should be cancelled

(Automated) Cancel Edge (click):
    G: I am drawing an edge (above)
    W: I click on empty space
    T: The line I'm drawing should be cancelled

(Automated) Finish drawing edge:
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
Panning(mouse):
    W: I right-click and drag 
    T: The canvas should pan

Zoom(mouse):
    W: I hold command (alt) and scroll
    T: The canvas should zoom
    
Panning (trackpad):
    G: I am using a trackpad
    W: I drag with 2 fingers
    T: The canvas should pan

Zoom (trackpad):
    G: I am using a trackpad
    W: I pinch with 2 fingers
    T: The canvas should zoom


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

Search files:
    G: I have logged in, and I am on the files page
    W: I type in the searchbar
    T: The files list is filtered by name

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

Delete file:
    G: I am logged in, on the "My files" page
    W: I click on the trashcan button
    T: My brwoser makes a DELETE request
    T: THe file dissapears

Rename a file:
    G: I am logged in, and have openned an existing file
    W: I rename the file, and wait for it to save
    T: My browser makes a PATCH request and updates the name of the existing file

    W: I go back to "My files"
    T: I should see the file has been renamed, not adding a new file


Autosave:
    G: I am logged in, and have openned a file
    W: I make changes to the nodes or edges
    T: I see the "saving" text, which turns to "saved" after I pause for a few seconds

Autosave - title:
    G: I am logged in, and have openned a file
    W: I make changes to the title
    T: I see the "saving" text, which turns to "saved" after I pause for a few seconds
    
Autosave - logged out:
    G: I am logged out, and have openned a file
    W: I make changes
    T: I don't see the "saving" text

Autosave - new file:
    G: I am logged out, and have used "new mindmap" to create a new file
    W: I make changes
    T: I see the "saving" text, which turns to "saved" after I pause for a few seconds

## Bugs

```
Duplicate toolbar event listeners:
    G: I have openned the canvas, then left to "my-file", then went back to the canvsa
    W: I press 't'
    T: the text-node tool is selected

Duplicate copy-paste event listeners:
    G: I have openned the canvas, then left to the homepage, then went back to the canvsa
    W: I select some nodes and copy
    T: I only see 1 copy notification, not several

Overlapping nodes / edges:
    G: I have 2 nodes, with an edge between them. One is bigger than the other
    W: I make the nodes overalp
    T: the app doesn't break

Occluded nodes / edges:
    G: I have 2 nodes, with an edge between them. One is bigger than the other
    W: I make the nodes overlap, so that one completely covers the other
    T: the app doesn't break
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


## Search

Search for text:
    G: I have some text nodes
    W: I type anything in search
    T: The canvas pans to the text I searched (found node in center)

Next Item with Enter:
    G: I have searched
    W: I press Enter
    T: The canvas switches to the next item

Next / Prev Item:
    G: I have searched
    W: I press the up and down arrorws
    T: The canvas moves between the items


## Colors
Create colored nodes:
    G: I am on the canvas
    W: I click on a color, then create a node
    T: That node is created with my selected color

Update color of a node:
    G: I am on the canvas
    G: I have a node selected 
    W: I click on a color
    T: That node is updated to my selected color

Update color of many nodes:
    G: I am on the canvas
    G: I have a node selected 
    W: I click on a color
    T: That node is updated to my selected color


## Folders
Create folder (in root):
    G: I am on the files page
    W: I click "Create Folder" and submit the form
    T: The folder appears

Create folder (nested):
    G: I am on the files page, and in a folder
    W: I click "Create Folder" and submit the form
    T: The folder appears

Navigate into Folder:
    G: I am on the files page, and there's a folder there
    W: I click on the folder
    T: I go into that folder, and see the files in it instead

Breadcrumbs:
    G: I am on the files page
    W: I navigate into a folder
    T: The breadcrumbs update to show my current folder location

breadcrumb navigation:
    G: I am on the files page, in a folder, and there are breadcrumbs
    W: I click on one of the breadcrumbs
    T: I move to that folder corresponding to the breadcrumb

Create file in folder:
    G: I am in a folder
    W: I click "Create mindmap" and enter a name
    T: It is created in that folder, not in the root

Create a file with a name:
    G: I am logged in
    G: Files page
    W: I click "New mindmap" and enter a name
    T: A new file is added to the page with the name I entered

## Touch Screen
Pan: 
    G: Im on the canvas page, using a ipad or phone
    W: Touch and drag on the empty space
    T: The canvas pans
    T: The blue group selection box does not show up

Move Object:
    G: Im on the canvas page, using a ipad or phone
    W: Touch and drag on an object
    T: The object moves but the canvas does not

## Copy Paste
Copy Paste Node:
    G: I'm on the canvas page, using a laptop
    G: I have a node selected
    W: I click "cmd+c" (or "ctrl+c"), then "cmd+v" (or "ctrl+v")
    T: The selected node is clones, just below and right of where the original was
    T: The new node is selected

Copy Paste Nodes and edges:
    G: I'm on the canvas page, using a laptop
    G: I have a group of nodes and edges selected
    W: I click "cmd+c" (or "ctrl+c"), then "cmd+v" (or "ctrl+v")
    T: The group is cloned, just below and right of where the original was
    T: The new group is selected

Paste non-mapo content
    G: I have some random stuff on my clipboard (non-mapo)
    When: I paste on the canvas
    T: The app keeps working. I see an error popup

Paste almost-mapo content
    G: I have mapo JSON data on my clipboard, but it's manipulated to be missing some fields
    When: I paste on the canvas
    T: The app keeps working. I see an error popup
