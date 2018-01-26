Ophidia analytics IDE
=====================

*Ophidia analytics IDE* is a Django-AngularJS application (GPLv3_-licensed) for the management of workflow-based experiments in Ophidia: in particular it offers support for their design, submission and monitoring.

Installation
------------

Required dependencies are python, pip and npm.

Download or clone the github repository:

.. code-block:: bash 

   $ git clone https://github.com/OphidiaBigData/ophidia-analytics-ide.git

Download Ophidia operators XML from https://github.com/OphidiaBigData/ophidia-analytics-framework/tree/master/etc/operators_xml into the folder static/operators_xml

To install *Ophidia analytics IDE* package run the following commands:

.. code-block:: bash 
   
   $ [sudo] pip install virtualenv
   $ virtualenv ophidia-py-env
   $ . ophidia-py-env/bin/activate
   $ pip install nodeenv
   $ nodeenv ophidia-node-env
   $ . ophidia-node-env/bin/activate
   $ cd <PATH-TO-ophidia-analytics-ide>
   $ pip install -r requirements.txt
   $ cd <PATH-TO-ophidia-py-env/lib/python2.7/site-packages>
   $ git clone -b devel https://github.com/OphidiaBigData/PyOphidia.git
   $ cd PyOphidia
   $ python setup.py install
   $ cd <PATH-TO-ophidia-analytics-ide>

   $ npm install -g bower
   $ npm install
   $ bower install
   $ python manage.py migrate
   $ python manage.py runserver 0.0.0.0:8000

Start the IDE
-------------

After the first installation, to startup the IDE run:

.. code-block:: bash 

   $ . ophidia-py-env/bin/activate
   $ . ophidia-node-env/bin/activate
   $ cd <PATH-TO-ophidia-analytics-ide>
   $ python manage.py runserver 0.0.0.0:8000

Examples
--------

In order to design, submit and monitor a workflow, the following steps are required:

* Open the application in your browser
* Login (top-right button)
* Fill in and save the connection parameters to an Ophidia Server (right panel, "Connection to Ophidia Server"
* Fill in and save the workflow global attributes (right panel, "Workflow Global Attributes")
* Drag and drop an operator from the categories available in the left panel to the worksheet
* If you wish rename it in the right panel ("Task details")
* Fill and save the required arguments, and if needed also the optional arguments.
* Drag another operator if needed. 
* In order to establish a dependence from a task from another drag an ouput arrow from the independent task to the dependent task.
* You can also create a new dependency from the right panel in "New dependency"
* If you wish to edit a dependency options open the right panel "Dependency options" and save
* When you are ready to submit your workflow, open the right panel "Submit workflow", add parameters if you inserted ${1}, ${2},... in your workflow, then submit.
* Check out your workflow status through the different colors associated to each task status


.. _GPLv3: http://www.gnu.org/licenses/gpl-3.0.txt

