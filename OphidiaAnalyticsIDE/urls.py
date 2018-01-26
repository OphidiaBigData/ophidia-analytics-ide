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

from django.conf.urls import include, url

# This two if you want to enable the Django Admin: (recommended)
from django.contrib import admin
admin.autodiscover()

from OphidiaAnalyticsIDE.views import IndexView

from editor.views import OperatorsList
from editor.views import WorkflowSubmission
from editor.views import WorkflowGraph
from editor.views import WorkflowMonitoring

from rest_framework_nested import routers

from authentication.views import OphidiaUserViewSet
from authentication.views import LoginView
from authentication.views import LogoutView

from workflows.views import OphidiaUserWorkflowsViewSet, WorkflowViewSet

router = routers.SimpleRouter()
router.register(r'accounts', OphidiaUserViewSet)

router.register(r'workflows', WorkflowViewSet)

accounts_router = routers.NestedSimpleRouter(
    router, r'accounts', lookup='ophidia_user'
)
accounts_router.register(r'workflows', OphidiaUserWorkflowsViewSet)

urlpatterns = [
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/', include(accounts_router.urls)),
    url(r'^api/v1/auth/login/$', LoginView.as_view(), name='login'),
    url(r'^api/v1/auth/logout/$', LogoutView.as_view(), name='logout'),
    url(r'^api/operators/$', OperatorsList.as_view()),
    url(r'^api/workflowSubmission/$', WorkflowSubmission.as_view()),
    url(r'^api/workflowGraph/$', WorkflowGraph.as_view()),
    url(r'^api/workflowMonitoring/$', WorkflowMonitoring.as_view()),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', IndexView.as_view(), name='index'),
]
