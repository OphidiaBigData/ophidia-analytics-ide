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

from rest_framework import permissions, viewsets
from rest_framework.response import Response

from workflows.models import Workflow
from workflows.permissions import IsAuthorOfWorkflow
from workflows.serializers import WorkflowSerializer


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.order_by('-created_at')
    serializer_class = WorkflowSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)
        return (permissions.IsAuthenticated(), IsAuthorOfWorkflow(),)

    def perform_create(self, serializer):
        instance = serializer.save(author=self.request.user)
        return super(WorkflowViewSet, self).perform_create(serializer)


class OphidiaUserWorkflowsViewSet(viewsets.ViewSet):
    queryset = Workflow.objects.select_related('author').all()
    serializer_class = WorkflowSerializer

    def list(self, request, ophidia_user_username=None):
        queryset = self.queryset.filter(author__username=ophidia_user_username)
        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)
