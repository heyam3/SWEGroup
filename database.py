import sqlite3 as sql

#Connects to Dromify database and confirms connection
conn = sql.connect('Dormify.db')
print("Opened database successfully")

#Creates cursor for excecution
cur= conn.cursor()

####Creates tables if tables don't already exists
#Primary Keys will be auto incremented integers

#*________________________________________________________________

#Creates Customer Table
#Contains: Username, Email, and Account Password
cur.execute('''CREATE TABLE IF NOT EXISTS Customer (
    user_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_Name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
)''')

#Creates Product Table
#Contains: Price, Description, Volume, and Weight
cur.execute('''CREATE TABLE IF NOT EXISTS Product (
    product_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    price DECIMAL(10,2),
    description TEXT,
    volume TEXT,
    weight DECIMAL(10,2)
)''')

#Creates Categor Table
#Contains: Name, Picture, and Description
cur.execute('''CREATE TABLE IF NOT EXISTS Category (
    cat_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    picture VARCHAR(255),
    description TEXT NOT NULL
)''')


#Creates Cart Table
#Contains: Username, and UserID
cur.execute('''CREATE TABLE IF NOT EXISTS Cart (
    quantity INTEGER,
    product_ID INTEGER NOT NULL,
    user_ID INTEGER NOT NULL,
    PRIMARY KEY (product_ID, user_ID),
    FOREIGN KEY (product_ID) REFERENCES Product(product_ID)
)''')

#Creates Order Table
#Contains: Amount and Date
cur.execute('''CREATE TABLE IF NOT EXISTS 'Order' (
    order_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10,2),
    date DATE
)''')

#Creates Payment Table
#Contains: Type, amount, and Date
cur.execute('''CREATE TABLE IF NOT EXISTS Payment (
    payment_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(255),
    amount DECIMAL(10,2),
    date DATE
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Images (
    image_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    image_Data BLOB
)''')

#Test Table creation by calling a value from the customer table
conn.commit
# print("Table created successfully")
# res = cur.execute("SELECT user_ID FROM customer")
# #Creates a row with values for further testing
# cur.execute('''INSERT INTO Product (name, price, description, volume) VALUES
#   ('GAEL', 10.00, 'help','try')
# ''')

# cur.execute('''SELECT p.name, p.price, c.quantity FROM Cart c JOIN Product p ON c.product_ID = p.product_ID''')

# print(cur.fetchall())

# #Calls rows with appropriate values.
# res = cur.execute("INSERT INTO Customer (user_Name, email, password) VALUES ('test','start','ree')")
# res = cur.execute("SELECT * FROM sqlite_master WHERE type='table'")
# print(res.fetchall())
conn.close()
