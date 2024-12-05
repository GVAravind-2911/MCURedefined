import requests

url = "https://api.imgur.com/3/image"
CLIENTID = "f7a420a28def437"

# payload={'type': 'image',
# 'title': 'BlogDefault Image',
# 'description': 'This is a the Default Blog Image'}
# files=[
#   ('image',('BlogDefault.png',open(r"D:\Programming\Projects\MCURedefined (Design Files)\NextJS Migration\static\img\BlogDefault.png",'rb'),'image/png'))
# ]
# headers = {
#   'Authorization': 'Client-ID {}'.format(CLIENTID)
# }

# response = requests.request("POST", url, headers=headers, data=payload, files=files)

# print(response.text)

data = '{"status":200,"success":true,"data":{"id":"JloNMTG","deletehash":"SpxCSyXq3lKr2EF","account_id":null,"account_url":null,"ad_type":null,"ad_url":null,"title":"BlogDefault Image","description":"This is a the Default Blog Image","name":"","type":"image/png","width":553,"height":365,"size":6197,"views":0,"section":null,"vote":null,"bandwidth":0,"animated":false,"favorite":false,"in_gallery":false,"in_most_viral":false,"has_sound":false,"is_ad":false,"nsfw":null,"link":"https://i.imgur.com/JloNMTG.png","tags":[],"datetime":1731558786,"mp4":"","hls":""}}'

payload = {}
files = {}
headers = {
  'Authorization': 'Client-ID {}'.format(CLIENTID)
}


# img = requests.get("https://api.imgur.com/3/image/JloNMTG", headers=headers, data=payload, files=files)



print(img.text)