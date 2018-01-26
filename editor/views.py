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

from django.shortcuts import render
from django.core import serializers
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from xmlparser import Xmlparser
from graph_builder import Graph_builder
from PyOphidia import client
from contextlib import contextmanager
import json
import os
import sys


from django.contrib.staticfiles import finders

# Find the absolute path of the operators xml directoy
path = finders.find('operators_xml')
parser = Xmlparser(path)


@contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout


class OperatorsList(APIView):
    def get(self, request, *args, **kw):
        operators = parser.get_all_operators()
        return Response({"success": True, "content": operators})


class WorkflowSubmission(APIView):
    def post(self, request, *args, **kw):
        workflow = request.data.get('workflow', "")
        parametersString = request.data.get('parametersString', "")
        server = request.data.get('server', "ophidialab.cmcc.it")
        port = request.data.get('port', "11732")
        username = request.data.get('username', None)
        password = request.data.get('password', None)

        with suppress_stdout():
            ophclient = client.Client(username, password, server, port)
            workflow = json.dumps(workflow)
            if parametersString == "":
                ophclient.wsubmit(workflow)
            else:
                parameters = parametersString.split(',')
                ophclient.wsubmit(workflow, *parameters)
            ophidia_response = ophclient.last_response
            ophidia_last_jobid = ophclient.last_jobid
            return Response({"success": True, "content": ophidia_response, "last_jobid": ophidia_last_jobid})


class WorkflowMonitoring(APIView):
    def post(self, request, *args, **kw):
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        server = request.data.get('server', "ophidialab.cmcc.it")
        port = request.data.get('port', "11732")
        query = request.data.get('query', None)
        with suppress_stdout():
            ophclient = client.Client(username, password, server, port)
            ophclient.submit(query)
            ophidia_response = ophclient.last_response
            return Response({"success": True, "content": ophidia_response})


class WorkflowGraph(APIView):
    def post(self, request, *args, **kw):
        workflow = request.data.get('workflow', None)
        if workflow is None:
            return Response({"success": False, "content": []})
        else:
            if isinstance(workflow, dict):
                w = workflow
                builder = Graph_builder(w)
                graph = builder.build_graph()
                maxDepth = builder.get_graph_maxDepth()
                nodes_at_heights = builder.get_nodes_at_heights()

                return Response({"success": True, "graph": graph, "maxDepth": maxDepth, "nodes_at_heights": nodes_at_heights})
            else:
                return Response({"success": False, "content": workflow})
