from urllib.request import urlopen
from bs4 import BeautifulSoup

url = "https://marvelcinematicuniverse.fandom.com/wiki/Iron_Man_2#Synopsis"
page = urlopen(url)
html = page.read().decode('utf-8')

soup = BeautifulSoup(html, 'html.parser')

# Replace 'id_name' with the actual id of the element you want to scrape
element = soup.find(id='Synopsis')

print(element)