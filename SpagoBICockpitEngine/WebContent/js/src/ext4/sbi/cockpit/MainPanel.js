/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/
 
Ext.ns("Sbi.cockpit");

/**
 * @class Sbi.cockpit.MainPanel
 * @extends Ext.Panel
 * 
 * The main panel of SpagoBI's cockpit engine.
 */

/**
 * @cfg {Object} config The configuration object passed to the constructor
 */
Sbi.cockpit.MainPanel = function(config) {
	
	this.validateConfigObject(config);
	this.adjustConfigObject(config);
	
	
	// init properties...
	var defaultSettings = {
			hideBorders: true
	};
	
	var settings = Sbi.getObjectSettings('Sbi.cockpit.core', defaultSettings);
	var c = Ext.apply(settings, config || {});
	Ext.apply(this, c);
	
	this.initServices();
	this.init();
	
	c = Ext.apply(c, {
		id: "mainPanel",
		bodyCls : "mainPanel",
        items    : [this.widgetContainer]
	});

	// constructor
	Sbi.cockpit.MainPanel.superclass.constructor.call(this, c);
};

Ext.extend(Sbi.cockpit.MainPanel, Ext.Panel, {
    
	// =================================================================================================================
	// PROPERTIES
	// =================================================================================================================
	
	/**
     * @property {Array} services
     * This array contains all the services invoked by this class
     */
    services: null
    
    /**
     * @property {Sbi.cockpit.core.WidgetContainer} widgetContainer
     * The container that manage the layout off all the widget contained in this cockpit
     */
    , widgetContainer: null
    
    /**
     * @property {Object} lastSavedAnalysisState
     * The last saved analysis state. Could be useful to check if the cockpit has been modified
     * and if necessary revert to last saved state. It could be null if the cockpit has not been
     * previously saved (i.e. cockpit creation)
     */
    , lastSavedAnalysisState: null
    
    /**
	 * @property {Ext.Window} associationEditorWizard
	 * The wizard that manages the associations definition
	 */
	, associationEditorWizard: null
    
	/**
	 * @property {Ext.Window} filterEditorWizard
	 * The wizard that manages the filters definition
	 */
	, filterEditorWizard: null
	
    , msgPanel: null
    
    // TODO remove from global
    , saved: null
   

    // =================================================================================================================
	// METHODS
	// =================================================================================================================
	
	/**
	 * @method 
	 * 
	 * Controls that the configuration object passed in to the class constructor contains all the compulsory properties. 
	 * If it is not the case an exception is thrown. Use it when there are properties necessary for the object
	 * construction for whom is not possible to find out a valid default value.
	 * 
	 * @param {Object} the configuration object passed in to the class constructor
	 * 
	 * @return {Object} the config object received as input
	 */
	, validateConfigObject: function(config) {
		
	}

	/**
	 * @method 
	 * 
	 * Modify the configuration object passed in to the class constructor adding/removing properties. Use it for example to 
	 * rename a property or to filter out not necessary properties.
	 * 
	 * @param {Object} the configuration object passed in to the class constructor
	 * 
	 * @return {Object} the modified version config object received as input
	 * 
	 */
	, adjustConfigObject: function(config) {
		config = config || {};
		if(Sbi.isValorized(config.analysisState)) {
			config.lastSavedAnalysisState = config.analysisState;
			delete config.analysisState;
		}
	}
	
	// -----------------------------------------------------------------------------------------------------------------
    // public methods
	// -----------------------------------------------------------------------------------------------------------------
	
	/**
	 * @method
	 * @deprecated
	 * 
	 * Returns the analysis state of this engine encoded as string. This method is usually called
	 * by parent container to generate the template to store in SpagoBI database when the document is saved
	 * by the user.
	 * 
	 * Replaced by #validateAnalysisState
	 */
	, validate: function (successHandler, failureHandler, scope) {
		Sbi.trace("[MainPanel.validate]: IN");
		
		var templeteStr = this.getTemplate();
		Sbi.trace("[MainPanel.validate]: template = " + templeteStr);
		
		Sbi.trace("[MainPanel.validate]: OUT");
		return templeteStr;
	}
	
	/**
	 * @method 
	 * Returns the cockpit current template that is equal to the current analysisState
	 * encoded as string
	 * 
	 * @return {String} The current template
	 */
	, getTemplate: function() {
		Sbi.trace("[MainPanel.getTemplate]: IN");
		var template = this.getAnalysisState();
		var templeteStr = Ext.JSON.encode(template);
		Sbi.trace("[MainPanel.getTemplate]: OUT");
		return templeteStr;
	}
	
	/**
	 * @method 
	 * Convert the template received as argument into a JSON object and the use it to set the current
	 * analysis state of the cockpit.
	 * 
	 * @param {String} template The template
	 */
	, setTemplate: function(template) {
		Sbi.trace("[MainPanel.setTemplate]: IN");
		if(Ext.isString(template)) {
			var analysisState = Ext.JSON.decode(template);
			this.setAnalysisState(analysisState);
		} else {
			Sbi.trace("[MainPanel.setTemplate]: Input parameter [template] is not of type [string]");
		}
		Sbi.trace("[MainPanel.setTemplate]: OUT");
	}
	
	/**
	 * @method
	 * 
	 * Returns weather the current analysis state is valid or not. Some engine during editing phase can
	 * allow inconsistent states. This method is usually called to deciede if the document can be saved or
	 * not. 
	 */
	, isValidAnalysisState: function() {
		// in cockpit engine all possible editing states are valid
		return true;
	}
	
	, validateAnalysisState: function(successHandler, failureHandler, scope) {
		var returnState = true;
		var analysisState =  this.getAnalysisState();
		
		successHandler = successHandler || function(){return true;};
		failureHandler = failureHandler || function(){return true;};
		
		if(this.isValidAnalysisState()) {
			if( successHandler.call(scope || this, analysisState) === false) {
				returnState = false;
			}
		} else { // impossible to go into this branch because the cockpit is allways valid :)
			// get the list of validation error messages
			var validationErrors = [];
			validationErrors.push("Error 1 caused by problem A");
			validationErrors.push("Error 2 caused by problem B");
			if( failureHandler.call(scope || this, analysisState, validationErrors) === false) {
				returnState = false;
			}
		}
		
		if(returnState) {
			return analysisState;
		} else {
			return null;
		}
	}
	
	/**
	 * @method
	 * 
	 * Returns the current analysis state. For the cockpit engine it is equal to #widgetContainer configuration
	 * and Sbi.storeManager configuration
	 * 
	 * @return {Object} The analysis state.
	 */
	, getAnalysisState: function () {	
		Sbi.trace("[MainPanel.getAnalysisState]: IN");
		var analysisState = {};
		
		analysisState.widgetsConf = this.widgetContainer.getConfiguration();
		analysisState.storesConf = Sbi.storeManager.getConfiguration();
		
		Sbi.trace("[MainPanel.getAnalysisState]: OUT");
		return analysisState;
	}
	
	, resetAnalysisState: function() {
		this.widgetContainer.resetConfiguration();
		Sbi.storeManager.resetConfiguration();
		//Sbi.storeManager.resetAssociations();
	}
	
	/**
	 * @method
	 */
	, setAnalysisState: function(analysisState) {
		Sbi.trace("[MainPanel.setAnalysisState]: IN");
		Sbi.storeManager.setConfiguration(analysisState.storesConf);
		this.widgetContainer.setConfiguration(analysisState.widgetsConf);
		Sbi.trace("[MainPanel.setAnalysisState]: OUT");
	}
	
	, isDocumentSaved: function() {
		if(Sbi.isNotValorized(this.documentSaved)) {
			this.documentSaved = !Ext.isEmpty(Sbi.config.docLabel);
		}
		
		return this.documentSaved ;
	}
	
	, isDocumentNotSaved: function() {
		return !this.isDocumentSaved();
	}
	
	, closeDocument : function() {
		Sbi.trace("[MainPanel.closeDocument]: IN");
		
		var url = Sbi.config.contextName + '/servlet/AdapterHTTP?ACTION_NAME=CREATE_DOCUMENT_START_ACTION&LIGHT_NAVIGATOR_RESET_INSERT=TRUE';
		
		Sbi.trace("[MainPanel.closeDocument]: go back to [" + Sbi.config.environment + "]");
		
		if (Sbi.config.environment == "MYANALYSIS") {
			sendMessage({newUrl:url},'closeDocument');	
		} else if (Sbi.config.environment == "DOCBROWSER") {
			sendMessage({},'closeDocument');
		} else {
			window.location = url;
		}
			   
		Sbi.trace("[MainPanel.closeDocument]: IN");   
	}
	
	, showSaveDocumentWin: function() {
		this.showSaveDocumentWindow(false);
	}
	
	, showSaveDocumentAsWin: function() {
		this.showSaveDocumentWindow(true);
	}
	
	, showSaveDocumentWindow: function(insert){
		Sbi.trace("[MainPanel.showSaveDocumentWindow]: IN");
		if(this.saveWindow != null){		
			this.saveWindow.close();
			this.saveWindow.destroy();
		}

		var template = this.getTemplate();
		Sbi.trace("[MainPanel.showSaveDocumentWindow]: template is equal to [" + template + "]");
		
		var documentWindowsParams = {				
			'OBJECT_TYPE': 'DOCUMENT_COMPOSITE',
			'OBJECT_TEMPLATE': template,
			'typeid': 'COCKPIT'
		};
		
		var formState = {};
		formState.visibility = true; //default for insertion
		formState.OBJECT_FUNCTIONALITIES  = Sbi.config.docFunctionalities;
		
		if (insert === true) {
			formState.docLabel = 'cockpit__' + Math.floor((Math.random()*1000000000)+1); 
			documentWindowsParams.MESSAGE_DET= 'DOC_SAVE';
			Sbi.trace("[MainPanel.showSaveDocumentWindow]: Document [" + formState.docLabel + "] will be created");
		} else {
			formState.docLabel = Sbi.config.docLabel;
			formState.docName = Sbi.config.docName;
			formState.docDescr = Sbi.config.docDescription;
			formState.visibility = Sbi.config.docIsVisible;
			formState.isPublic = Sbi.config.docIsPublic;
			documentWindowsParams.MESSAGE_DET= 'MODIFY_COCKPIT';
			Sbi.trace("[MainPanel.showSaveDocumentWindow]: Document [" + formState.docLabel + "] will be updated");
		}
		documentWindowsParams.formState = formState;
		documentWindowsParams.isInsert = insert;
		documentWindowsParams.fromMyAnalysis = Sbi.config.fromMyAnalysis;
		
		this.saveWindow = new Sbi.widgets.SaveDocumentWindow(documentWindowsParams);
		
		this.saveWindow.on('savedocument', this.onSaveDocument, this);
		//this.saveWindow.on('closeDocument', this.returnToMyAnalysis, this);
		
		this.saveWindow.show();		

		Sbi.trace("[MainPanel.showSaveDocumentWindow]: OUT");
	}
	
	//-----------------------------------------------------------------------------------------------------------------
	// utility methods
	// -----------------------------------------------------------------------------------------------------------------
	
	, onAddWidget: function() {
		// add an empty widget in the default region of the container
		this.widgetContainer.addWidget();
	}
	
	, onShowAssociationEditorWizard: function(){
		if (Sbi.storeManager.getStoreIds().length == 0){
			alert('Per gestire le associazioni � necessario creare prima dei widget!');
			return;
		}
		var config = {};
		config.stores = Sbi.storeManager.getStoreIds();
		Sbi.trace("[MainPanel.showAssociationEditorWizard]: config.stores is equal to [" + Sbi.toSource(config.stores) + "]");    	
		
		config.associations = Sbi.storeManager.getAssociations();
		Sbi.trace("[MainPanel.showAssociationEditorWizard]: config.associations is equal to [" + Sbi.toSource(config.associations) + "]");    	
		
   		Sbi.trace("[MainPanel.showAssociationEditorWizard]: instatiating the editor");    		
   		this.associationEditorWizard = Ext.create('Sbi.data.AssociationEditorWizard', config);
   		this.associationEditorWizard.on("submit", this.onAssociationEditorWizardSubmit, this);
   		this.associationEditorWizard.on("cancel", this.onAssociationEditorWizardCancel, this);
   		this.associationEditorWizard.on("apply", this.onAssociationEditorWizardApply, this);    		
    	Sbi.trace("[MainPanel.showAssociationEditorWizard]: editor succesfully instantiated");

				
		this.associationEditorWizard.show();
	}
	
	, onAssociationEditorWizardCancel: function(wizard) {
		Sbi.trace("[MainPanel.onAssociationEditorWizardCancel]: IN");
		this.associationEditorWizard.close();
		this.associationEditorWizard.destroy();
		Sbi.trace("[MainPanel.onAssociationEditorWizardCancel]: OUT");
	}
	
	, onAssociationEditorWizardSubmit: function(wizard) {
		Sbi.trace("[MainPanel.onAssociationEditorWizardSubmit]: IN");
		var wizardState = wizard.getWizardState();
		if (Sbi.isValorized(wizardState.associations)){
			Sbi.storeManager.setAssociationConfigurations(wizardState.associations);
			Sbi.trace("[MainPanel.onAssociationEditorWizardSubmit]: setted relation group [" + Sbi.toSource(wizardState.associations) + "] succesfully added to store manager");
		}
		this.associationEditorWizard.close();
		this.associationEditorWizard.destroy();
		Sbi.trace("[MainPanel.onAssociationEditorWizardSubmit]: OUT");
	}
	
	, onShowFilterEditorWizard: function(){
		var config = {};
		config.storesList = Sbi.storeManager.getStoreIds();
//		if(this.filterEditorWizard === null) {    		
    		Sbi.trace("[MainPanel.showFilterEditorWizard]: instatiating the editor");    		
    		this.filterEditorWizard = Ext.create('Sbi.filters.FilterEditorWizard',config);
    		this.filterEditorWizard.on("submit", this.onFilterEditorWizardSubmit, this);
    		this.filterEditorWizard.on("cancel", this.onFilterEditorWizardCancel, this);
//    		this.filterEditorWizard.on("apply", this.onFilterEditorWizardApply, this);    		
	    	Sbi.trace("[MainPanel.filterEditorWizard]: editor succesfully instantiated");
//    	}
				
		this.filterEditorWizard.show();
	}
	
	, onFilterEditorWizardCancel: function(wizard) {
		Sbi.trace("[MainPanel.onFilterEditorWizardCancel]: IN");
		this.filterEditorWizard.close();
		this.filterEditorWizard.destroy();
		Sbi.trace("[MainPanel.onFilterEditorWizardCancel]: OUT");
	}
	
	, onFilterEditorWizardSubmit: function(wizard) {
		Sbi.trace("[MainPanel.onFilterEditorWizardSubmit]: IN");
//		var wizardState = wizard.getWizardState();
//		if (wizardState.associationsList != null && wizardState.associationsList !== undefined){
//			Sbi.storeManager.resetAssociations(); //reset old associations
//			Sbi.storeManager.setAssociations(wizardState.associationsList);
//			Sbi.trace("[MainPanel.onFilterEditorWizardSubmit]: setted relation group [" + Sbi.toSource(wizardState.associationsList) + "] succesfully added to store manager");
//		}
		this.filterEditorWizard.close();
		this.filterEditorWizard.destroy();
		Sbi.trace("[MainPanel.onFilterEditorWizardSubmit]: OUT");
	}
	
	
	
	, onShowSaveDocumentWindow: function() {
		this.showSaveDocumentWin();
	}
	
	, onShowSaveDocumentAsWindow: function() {
		this.showSaveDocumentAsWin();
	}
	
	, onSaveDocument: function(win, closeDocument, params) {	
		Sbi.trace("[MainPanel.onSaveDocument]: IN");
		this.documentSaved = true;
		
		// show save button (the button that allow to perform save as)
		var itemEl = Ext.get('save');
		if(itemEl && itemEl !== null) {
			itemEl.hidden = false;
		}	
		
		Sbi.trace("[MainPanel.onSaveDocument]: Input parameter [closeDocument] is equal to [" + closeDocument + "]");
		if(closeDocument === true) {
			this.closeDocument();
		}
		Sbi.trace("[MainPanel.onSaveDocument]: OUT");
	}
	
	, onDebug: function() {
		this.debug();
	}
	
	//-----------------------------------------------------------------------------------------------------------------
	// init methods
	// -----------------------------------------------------------------------------------------------------------------

	/**
	 * @method 
	 * 
	 * Initialize the following services exploited by this component.
	 *    
	 */
	, initServices: function() {
		this.services = this.services || new Array();	
	}
	
	
	/**
	 * @method 
	 * 
	 * Initialize the GUI
	 */
	, init: function() {
		this.initToolbar();
		this.initWidgetContainer();
	}
	
	, initToolbar: function() {
	
		this.tbar = new Ext.Toolbar({
		    items: [
		        '->', // same as {xtype: 'tbfill'}, // Ext.Toolbar.Fill
		        {
		        	text: LN('sbi.cockpit.mainpanel.btn.filters')
		        	, handler: this.onShowFilterEditorWizard
		        	, scope: this
		        },
		        {
		        	text: LN('sbi.cockpit.mainpanel.btn.associations')
		        	, handler: this.onShowAssociationEditorWizard
		        	, scope: this
		        },{
		        	text: LN('sbi.cockpit.mainpanel.btn.addWidget')
		        	, handler: this.onAddWidget
		        	, scope: this
		        },	new Ext.Button({
		        			id: 'save'
		        		   , iconCls: 'icon-save' 
		 				   , tooltip: 'Save'
		 				   , scope: this
		 				   , handler:  this.onShowSaveDocumentWindow
		 				   , hidden: this.isDocumentNotSaved()
		 		 }), new Ext.Button({
		 			 		id: 'saveAs'
		 			   	   , iconCls: 'icon-saveas' 
		 				   , tooltip: 'Save As'
		 				   , scope: this
		 				   , handler:  this.onShowSaveDocumentAsWindow
		 		 }), new Ext.Button({
	 			 		id: 'debug'
			 	   	   , text: 'Debug'
			 	       , scope: this
			 		   , handler:  this.onDebug
			 	 })
		    ]
		});
	}		
	
	, initWidgetContainer: function() { 
		Sbi.trace("[MainPanel.initWidgetContainer]: IN");

		var conf = {};
		if(Sbi.isValorized(this.lastSavedAnalysisState)) {
			conf = this.lastSavedAnalysisState.widgetsConf;
		}
		this.widgetContainer = new Sbi.cockpit.core.WidgetContainer(conf);
		
		Sbi.trace("[MainPanel.initWidgetContainer]: widget panel succesfully created");
		
		Sbi.trace("[MainPanel.initWidgetContainer]: OUT");
	}
	
	
	//-----------------------------------------------------------------------------------------------------------------
	// test methods
	// -----------------------------------------------------------------------------------------------------------------
	
	/**
	 * @method
	 * @private
	 * 
	 */
	, debug: function() {
		Sbi.trace("[MainPanel.debug]: IN");
		testFunctions = [];
		for(p in this) {			
			if( p.indexOf("Test", p.length - "Test".length) !== -1 ) {
				if(Ext.isFunction(this[p]))
				testFunctions.push(p);
			}
		}
		
		for(var i = 0; i < testFunctions.length; i++) {
			this.setUp();
			var result = this[testFunctions[i]]();
			if(result == null) {
				alert("Test [" + testFunctions[i] + "] succesfully executed");
			} else {
				alert("Test [" + testFunctions[i] + "] not passed: " + result);
			}
			this.tearDown();
		}
		
		Sbi.trace("[MainPanel.debug]: OUT");
	}
	
	
	, setUp: function() {
		Sbi.trace("[MainPanel.setUp]: IN");
		var template = '{"widgetsConf":{"widgets":[{"storeId":"ds__462040106","wtype":"table","wconf":{"wtype":"table","visibleselectfields":[{"id":"Comune","alias":"Comune","funct":"NONE","iconCls":"attribute","nature":"attribute","values":"[]","precision":"","options":{}},{"id":"numero","alias":"numero","funct":"NONE","iconCls":"measure","nature":"measure","values":"[]","precision":"2","options":{}}]},"wstyle":{},"wlayout":{"region":{"width":"0.20","height":"0.86","x":"0.01","y":"0.06"}}},{"storeId":"ds__4705859","wtype":"table","wconf":{"wtype":"table","visibleselectfields":[{"id":"ABITANTI","alias":"ABITANTI","funct":"NONE","iconCls":"measure","nature":"measure","values":"[]","precision":"2","options":{}},{"id":"GG","alias":"GG","funct":"NONE","iconCls":"measure","nature":"measure","values":"[]","precision":"2","options":{}}]},"wstyle":{},"wlayout":{"region":{"width":"0.18","height":"0.85","x":"0.22","y":"0.06"}}},{"storeId":"ds__745200072","wtype":"table","wconf":{"wtype":"table","visibleselectfields":[{"id":"Comune","alias":"Comune","funct":"NaN","iconCls":"attribute","nature":"attribute","values":"[]"},{"id":"Femmine corsi a tempo pieno","alias":"Femmine corsi a tempo pieno","funct":"NaN","iconCls":"measure","nature":"measure","values":"[]"},{"id":"Femmine corsi per apprendisti","alias":"Femmine corsi per apprendisti","funct":"NaN","iconCls":"measure","nature":"measure","values":"[]"},{"id":"Femmine Totale","alias":"Femmine Totale","funct":"NaN","iconCls":"measure","nature":"measure","values":"[]"}]},"wstyle":{},"wlayout":{"region":{"width":"0.32","height":"0.43","x":"0.42","y":"0.21"}}}]},"storesConf":{"stores":[{"storeId":"ds__462040106"},{"storeId":"ds__4705859"},{"storeId":"ds__745200072"}],"associations":[{"id":"#0","description":"ds__4705859.BIRRA_SFRU=ds__745200072.Totale corsi a tempo pieno","fields":[{"store":"ds__4705859","column":"BIRRA_SFRU"},{"store":"ds__745200072","column":"Totale corsi a tempo pieno"}]}]},"associationsConf":[{"id":"#0","description":"ds__4705859.BIRRA_SFRU=ds__745200072.Totale corsi a tempo pieno","fields":[{"store":"ds__4705859","column":"BIRRA_SFRU"},{"store":"ds__745200072","column":"Totale corsi a tempo pieno"}]}]}';
		this.setTemplate(template);
		Sbi.trace("[MainPanel.setUp]: OUT");
	}
	
	, tearDown: function() {
		Sbi.trace("[MainPanel.tearDown]: IN");
		this.resetAnalysisState();
		Sbi.trace("[MainPanel.tearDown]: OUT");
	}
	
	
	/**
	 * @method
	 * @private
	 * 
	 */
	, initTest: function() {
		if(this.widgetContainer.getWidgetsCount() != 3) {
			return "Widgets count is [" + this.widgetContainer.getWidgetsCount() + "] " +
					"while expected is [3]";
		}
		
		if(Sbi.storeManager.getStoresCount() != 3) {
			return "Stores count is [" + Sbi.storeManager.getStoresCount() + "] " +
					"while expected is [3]";
		}
		
		return null;
	}
	
	/**
	 * @method
	 * @private
	 * 
	 */
	, resetTest: function() {
		this.resetAnalysisState();
		
		if(this.widgetContainer.getWidgetsCount() != 0) {
			return "Widgets count is [" + this.widgetContainer.getWidgetsCount() + "] " +
					"while expected is [0]";
		}
		
		if(Sbi.storeManager.getStoresCount() != 0) {
			return "Stores count is [" + Sbi.storeManager.getStoresCount() + "] " +
					"while expected is [0]";
		}
		
		return null;
	}
	
	, removeWidgetTest: function() {
		var widget = this.widgetContainer.getWidgetManager().getWidgets()[0];
		this.widgetContainer.removeWidget(widget);
		
		if(this.widgetContainer.getWidgetsCount() != 2) {
			return "Widgets count is [" + this.widgetContainer.getWidgetsCount() + "] " +
					"while expected is [2]";
		}
		
		if(Sbi.storeManager.getStoresCount() != 2) {
			return "Stores count is [" + Sbi.storeManager.getStoresCount() + "] " +
					"while expected is [2]";
		}
		
		return null;
	}
	
	// assets
	
	, assertEqual: function(x, y, msg) {
		
	}
});