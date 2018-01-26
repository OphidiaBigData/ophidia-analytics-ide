#
#     Ophidia Analytics IDE
#     Copyright (C) 2017-2018 CMCC Foundation
#
#     This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

from os import listdir
import xml.etree.ElementTree as ET


class Xmlparser():
    def __init__(self, path):
        self.path = path
        self.operators = []

    def show_operator_list(self):
        op_list = listdir(self.path)
        for i in op_list:
            tree = ET.parse(self.path + '/' + i)
            root = tree.getroot()
            op_name = root.attrib.get('name').lower()
            self.operators.append(op_name)
        return self.operators

    # This method returns a list of operators, each operator object contains
    # as keys: name, filename and args; args is a list of arguments, each
    # specifying name, default, type, mandatory, values, minvalue and maxvalue
    def get_all_operators(self):
        dir_entries = listdir(self.path)
        operators = []
        for i in dir_entries:
            tree = ET.parse(self.path + '/' + i)
            root = tree.getroot()
            op_name = root.attrib.get('name').lower()
            info = root.find('info')
            if info.find('category') is not None:
                op_category = info.find('category').text
            operator = {'filename': i, 'name': op_name, 'category': op_category, 'args': []}
            args = []
            for child in root.findall('args'):
                argument = child.findall('argument')
                for i in argument:
                    name = i.text
                    default = i.get('default')
                    type = i.get('type')
                    mandatory = i.get('mandatory')
                    values = i.get('values')
                    multivalue = i.get('multivalue')
                    minvalue = i.get('minvalue')
                    maxvalue = i.get('maxvalue')
                    argument = {'name': name, 'default': default, 'type': type, 'mandatory': mandatory,
                                'multivalue': multivalue, 'values': values, 'minvalue': minvalue, 'maxvalue': maxvalue}
                    args.append(argument)
            operator['args'] = args
            operators.append(operator)
            self.operators = operators
        return operators
