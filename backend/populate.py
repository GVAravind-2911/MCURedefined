from dmm import Timeline
from tkinter import *
from tkinter import ttk

def Fill(name):
    data = Timeline.getTkinterContent(name) # Correct method name
    if data:
        b.delete('1.0', END)
        b.insert('1.0', data[0])
        c.delete(0, END)
        c.insert(0, data[1])
        d.delete(0, END)
        d.insert(0, data[2])
        e.delete('1.0', END)
        e.insert('1.0', data[3])

def on_option_change(*args):
    Fill(var.get())

a = Tk()
var = StringVar()
var.trace_add('write',on_option_change)
sel = ttk.OptionMenu(a,var,'Select Project:',*Timeline.forPopulate())
sel.pack()
wid1 = Label(a,text='Synopsis')
wid1.pack()
b = Text(a,height=10)
b.pack()
wid2 = Label(a,text = 'Music Director')
wid2.pack()
c = Entry(a)
c.pack()
wid3 = Label(a,text = 'Director')
wid3.pack()
d = Entry(a)
d.pack()
wid4 = Label(a,text = 'Cast')
wid4.pack()
e = Text(a,height=10)
e.pack()
wid5 = Label(a,text = 'Timeline Position:')
wid5.pack()
varforid = IntVar()
options = list(range(1,30))
f = ttk.OptionMenu(a,varforid,'Select',*options)
f.pack()
def fetchvals():
    projname = var.get().strip()
    syntext = b.get('1.0',END).strip()
    musicd = c.get().strip()
    direc = d.get().strip()
    cast = e.get('1.0',END)
    cast = cast.split('\n')
    castlist = []
    for i in cast:
        castlist.append(i.split(' as ')[0])
    castlist = [i for i in castlist if i!='']
    strcast = ''
    for i in castlist[:-1]:
        strcast+=i+', '
    strcast+=castlist[-1]
    timelinepos = varforid.get()
    Timeline.updateViaTkinter(projname,syntext,strcast,direc,musicd, timelinepos)
    b.delete('1.0',END)
    c.delete(0,END)
    d.delete(0,END)
    e.delete('1.0',END)


button1 = ttk.Button(a,text='Update',command=fetchvals)
button1.pack()

a.mainloop()