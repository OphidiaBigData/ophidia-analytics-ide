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

import json
import os


class Graph_builder():

    def __init__(self, workflow):
        self.workflow = workflow
        self.maxHeight = 0
        self.heights = []
        self.nodes_at_heights = []
        self.graph = []

    def build_graph(self):
        for index, task in enumerate(self.workflow['tasks']):
            if 'dependencies' in task and task['dependencies']:
                for dependency in task['dependencies']:
                    for index2, task2 in enumerate(self.workflow['tasks']):
                        if dependency['task'] == task2['name']:
                            dependency['task_index'] = index2
                            dependency['task_name'] = task2['name']
                            if 'dependents_indexes' not in task2 or not task2['dependents_indexes']:
                                task2['dependents_indexes'] = []
                            task2['dependents_indexes'].append({'index': index, 'name': task['name']})
                            break

        class WorkflowNode():
            def __init__(self):
                self.out_edges = []
                self.out_edges_num = 0
                self.in_edges = []
                self.in_edges_num = 0
                self.index = 0
                self.name = ""
                self.operator = {}

        graph = []
        for index, task in enumerate(self.workflow['tasks']):
            node = WorkflowNode()
            if 'dependencies' in task and task['dependencies']:
                node.in_edges_num = len(task['dependencies'])
                for dependency in task['dependencies']:
                    node.in_edges.append({'index': dependency['task_index'], 'name': dependency['task_name']})
            if 'dependents_indexes' in task and task['dependents_indexes']:
                node.out_edges_num = len(task['dependents_indexes'])
                for dependent in task['dependents_indexes']:
                    node.out_edges.append({'index': dependent['index'], 'name': dependent['name']})
            if 'name' in task and task['name']:
                node.name = task['name']
            if 'operator' in task and task['operator']:
                node.operator = task['operator']
            node.index = index
            self.graph.append(node)
            graph.append(node.__dict__)
        return graph

    def maxDepth(self, node):
        maxD = 0
        depth = []
        if node is None:
            return 0
        else:
            if node.out_edges:
                for node2 in node.out_edges:
                    maxD = max(maxD, self.maxDepth(self.graph[node2['index']])) + 1
        return maxD

    def get_graph_maxDepth(self):
        maxHeight = 0
        for node in self.graph:
            self.heights.append({"node": node.index, "height": self.maxDepth(node)})
            maxHeight = max(maxHeight, self.maxDepth(node))
        self.maxHeight = maxHeight
        return maxHeight

    def get_nodes_at_heights(self):
        for i in range(self.maxHeight + 1):
            self.nodes_at_heights.append({"height": i, "nodes": []})
            for h in self.heights:
                if h["height"] == i:
                    for item in self.nodes_at_heights:
                        if item["height"] == i:
                            item["nodes"].append(h["node"])
        self.nodes_at_heights = [i for i in self.nodes_at_heights if i["nodes"] != []]
        return self.nodes_at_heights
