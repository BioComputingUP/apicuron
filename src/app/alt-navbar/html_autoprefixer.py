from bs4 import BeautifulSoup

def updated_class(classes):
    output = []
    for classElem in classes:
        if len(classElem.split(':')) > 1:
            [breakpt, clsname] = classElem.split(':')
            new_cls = ''.join([breakpt, ':tw-', clsname])
        else:
            new_cls = 'tw-' + classElem
        output.append(new_cls)
    return output
    


with open('src/app/alt-navbar/alt-navbar.component.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')
    # print(soup.prettify())

    for div in soup.find_all():
        classes = div.get('class')
        if classes:
            div['class'] = updated_class(classes)


# html = soup.prettify(soup.original_encoding)
with open('src/app/alt-navbar/alt-navbar.2.html', 'w') as file:
    file.write(str(soup))
