/*
 * Page contents
 *
 * DOINGS JS REFERENCE
 * add @ at the beggining
 * of any reference name
 * in your finder to move
 * ei.
 *      @TOP
 *
 *    * codekit Imports
 *          @codekit-prepend "_itemsDelete.js";
 *	    @codekit-prepend "_errorRefreshLink.js";
 *          @codekit-prepend "_decorateDoing.js";
 * 
 *
 *    * App dependencies
 *          OAT 2.0
 *
 *    * App objects
 *          IDR || initDoingRender
 *          SEM || sectionEditMode
 *          AI  || addItems
 *          UM  || uploadModal
 *          CC  || coverChange
 *          SI  || sortItems
 *          DPD || doingPullDown
 *          NAVM|| navMarkers
 *          DIE || doingInfoEdit
 *          DD  || deleteDoing
 *
 *    * Object Inits
 *          initIDR
 *          initSC || SectionCarouselInit
 *          initIA
 *          initCC
 *          initIDEL
 *          initDEC || DEC
 *
 - Authors-
 * Paul A.R. Rada
 *
 * NOTES : most apps are turned to modeOff() when the carousel moves
 * all of this can be seen in the carousel module's nextPane and
 * prevPane functions. look for them under the @doings tag in the
 * carousel app.
 *
 */

/*
 * for the Carousel app
 * requestAnimationFrame and cancel polyfill
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame =
	    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
	window.requestAnimationFrame = function(callback, element) {
	    var currTime = new Date().getTime();
	    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				       timeToCall);
	    lastTime = currTime + timeToCall;
	    return id;
	};

    if (!window.cancelAnimationFrame)
	window.cancelAnimationFrame = function(id) {
	    clearTimeout(id);
	};
}());



$(function($){
	//
	'use_strict';

	/*
	 * Global App inits and vars
	 * @globalVars
	 * @inIDR
	 */
	var initDoingRequest,
	    sectionsEditMode,
	    sectionCarousel,
	    navMarkers,
	    itemsDelete,
	    addItems,
	    coverChange,
	    sortItems,
	    doingPullDown,
	    doingInfoEdit,
	    deleteDoing,
	    errorRefresh,
	    decorateDoing;

	/*
	 * OAT 2.0 template
	 *
	 * @OAT
	 *
	 */

	var OAT = function( spec ){
	    //
	    spec = spec || {};
	    //
	    var that = {
		settings : {
		    templates : {
			doingInfo : {
			    location : 'doingInfoTemplateLocation',
			    target : 'doingInfoTemplateTarget'
			},
			doingInfoEdit : {
			    location : 'doingInfoEditTemplateLocation',
			    target : 'doingInfoTemplateTarget'
			},
			sections : {
			    location : 'sectionsTemplateLocation',
			    target : 'sectionsTemplateTarget'
			},
			addItems : {
			    location : 'addItemsTemplateLocation',
			    target : 'addItemsTemplateTarget'
			},
			background : {
			    location : 'backgroundTemplateLocation',
			    target : 'backgroundTemplateTarget'
			}
		    },
		    ajaxSettings : {
			url : '/init_ajax/',
			type : 'get',
			data : '',
			dataType : 'json',
			cache : false,
			timeout : '8000',
			scope : that,
			success : function(){ return true; }
		    }
		}
	    };
	    //
	    // extend the settings with the spec
	    that.settings = $.extend( true , that.settings , spec );
	    //
	    // helper methods ----------------------------
	    //
	    that.helper = {
		// @helper
		// @OATHelper

		ajaxRequest : function( optionsObject ){
		    //
		    //@ajaxTemp
		    //re-abstracting the jQ ajax so errors are handled by default
		    optionsObject = optionsObject || {};
		    //
		    var request,
		    options;
		    //
		    //combine the parameters into the default options
		    options = $.extend(
				       that.settings.ajaxSettings ,
				       optionsObject
				       );
		    //		    
		    if(request){
			request.abort();
		    };
		    //
		    request = $.ajax({
			    url : options.url,
			    type : options.type,
			    dataType : options.dataType,
			    data : options.data,
			    cache : options.cache,
			    timeout : options.timeout,

			    beforeSend : function(){
				$('#ajaxError').hide();
				$('#ajaxLoading').show();
			    },
			    error : function(){
				$('#ajaxError').show();
				$('#ajaxLoading').hide();

			    },
			    complete : function(){
				$('#ajaxLoading').hide();
			    },
			    success : function(result){
				//
				//apply the callbackFunction
				options.success.apply( options.scope , [result] );
			    }
			});
		    //
		    return options.scope;
		},


		setTemplateIds : function( templateName ){
		    //
		    if( templateName === 'sections' ){
			//
			that.settings.refreshCarousel = true;
			//
		    };
		    //
		    // load the current template ids for refreshing
		    that.settings.templateLocationId =
		    that.settings.templates[ templateName ].location;
		    //
		    that.settings.templateTargetId =
		    that.settings.templates[ templateName ].target;
		    //
		    return this;
		},


		getTemplateIdsOf : function( templateName ){
		    //
		    var location = that.settings.templates[ templateName ].location,
		    target = that.settings.templates[ templateName ].target;
		    //
		    return {
			location : location,
			    target : target
			    };
		},


		refreshTemplate : function( result ){
		    //
		    // merge the new data recursively
		    $.contextVar = $.extend( true, $.contextVar , result );
		    //
		    this.createItemHrefs();
		    //
		    // grap the template and target
		    var template = $( '#'+ that.settings.templateLocationId ).html(),
		    $target =   $( '#'+ that.settings.templateTargetId );
		    //
		    // render and Inject it
		    $target.html( _.template( template , { data : $.contextVar } ) );
		    //
		    if( that.settings.refreshCarousel ){
			//
			if ( sectionCarousel ){
			    //
			    this.remakeSectionCarousel();
			    //
			}
		    }
		    //
		    return this;
		},


		showSaved : function(){
		    //
		    var $savedCase = $( '#ajaxSaved' );
		    //
		    $savedCase.fadeIn('fast');
		    //
		    window.setTimeout( function(){
			    //
			    $savedCase.fadeOut('fast');
			    //
			}, 700 );
		    //
		    return this;
		},


		killAllEditModes : function(){
		    //
		    // @killAllEditModes
		    // check if any of the apps are active
		    // turn their modes off if true
		    //
		    //
		    // sectionEditMode modes -----//
		    if( sectionsEditMode &&
			sectionsEditMode.settings.isModeOn ){
			//
			sectionsEditMode.modeOff();
			//
		    };
		    //
		    // doingInfo modes -----------//
		    //
		    if( doingInfoEdit &&
		        doingInfoEdit.settings.isModeOn ){
			//
			doingInfoEdit.modeOff();
			//
		    }
		    //
		    // section's modes ----------//
		    //
		    if( addItems &&
			addItems.settings.isModeOn ){
			//
			addItems.modeOff();
			//
		    }
		    //
		    if( sortItems &&
			sortItems.settings.isModeOn ){
			//
			sortItems.modeOff();
			//
		    }
		    //
		    if( itemsDelete &&
			itemsDelete.settings.isModeOn ){
			//
			itemsDelete.modeOff();
			//
		    }
		    //
		    if( coverChange &&
			coverChange.settings.isModeOn ){
			//
			coverChange.modeOff();
			//
		    }
		    //
		    return this;
		    //
		},


		createItemHrefs : function(){
		    //
		    var doingId = $.contextVar.doing_id,
		    sectionIds = new Array(),
		    itemIds = new Array();
		    //
		    for( var i in $.contextVar.sections ){
			//
			sectionIds[i] = $.contextVar.sections[i].section_id;
			//
			for( var iter in $.contextVar.sections[i].section_items ){
			    //
			    itemIds[iter] = $.contextVar.sections[i].section_items[iter].item_id;
			    //
			    $.contextVar.sections[i].section_items[iter].item_href =
				'/'+ doingId + '/' + sectionIds[i] + '/' + itemIds[iter] +'/';
			    //
			}; // for items
			//
		    }; // for sections
		    //
		    return this;
		    //
		},


		attatchAnimate : function( $el ){
		    //
		    $el.addClass( 'animate' );
		    //
		    return this;
		    //
		},

		detatchAnimate : function( $el ){
		    //
		    $el.removeClass( 'animate' );
		    //
		    return this;
		    //
		},

		remakeSectionCarousel : function(){
		    //
		    sectionCarousel = Carousel( '#sectionCarousel' );
		    sectionCarousel.init();
		    //
		    return this;
		},

		destroySectionCarousel : function(){
		    //
		    delete sectionCarousel;
		    //
		    return this;
		}


	    }; // end helpers

	    return that;
	};// OAT OBJECT


	/*
	 *initial doing ajax request
	 *
	 * @initDoingRequest
	 * @IDR
	 *
	 */
	var InitDoingRequest = function(){
	    //
	    var IDR = OAT(),
	    s = IDR.settings;


	    IDR.init = function(){
		//
		IDR.requestData()
		//
		return IDR;
		//
	    };


	    IDR.requestData = function(){
		//
		var ajaxSettings = {
		    url : '/doing_header_content_ajax/',
		    type : 'POST',
		    dataType : 'json',
		    data : { doing_id : $.contextVar.doing_id },
		    scope : IDR,
		    success : function( result ){
			//
			IDR
			//
			.renderData( result )
			//
			.initOtherApps();
			//
		    }
		};
		//
		// call the ajax request with the new settings object
		IDR.helper.ajaxRequest( ajaxSettings );
		//
		return IDR
	    };



	    IDR.renderData = function( result ){
		//
		IDR.helper
		//
		// refresh the Doing Info template
		.setTemplateIds( 'doingInfo' )
		.refreshTemplate( result )
		//
		//
		// refresh the section template
		.setTemplateIds( 'sections' )
		.refreshTemplate( result );
		//
		return IDR;
	    };


	    IDR.initOtherApps = function(){
		//
		// @initErrorRefresh
		// @initER
		errorRefresh = $.modules.ErrorRefreshLink().init();
		//
		//
		// @initNavMarkers
		// @initNAVM
		navMarkers = NavMarkers();
		//
		// @initSectionsEditMode
		// @initSEM
		sectionsEditMode = SectionsEditMode();
		//
		// @SectionCarouselInit
		// @initSC
		IDR.helper.remakeSectionCarousel();
		//
		// @initDoingPullDown
		// @initDPD
		doingPullDown = DoingPullDown().init();
		//
		// @initDoingsInfoEdit
		// @initDIE
		doingInfoEdit = DoingInfoEdit().init();
		//
		// @initAddItems
		// @initAI
		addItems = AddItems().init();
		//
		// @initCoverChange
		// @initCC
		coverChange = CoverChange().init();
		//
		// @initSortItems
		// @initSI
		sortItems = SortItems().init();
		//
		// @initIDEL
		// Set the itemDelete module Settings
		itemsDelete = $.modules.ItemsDelete({
			//
			// tell the module its context
			pageContext : 'doing',
			//
			// refresh Template Specifics
			templateLocationId : IDR.helper.getTemplateIdsOf( 'sections' ).location,
			//
			templateTargetId :  IDR.helper.getTemplateIdsOf( 'sections' ).target,
			//
			// ajax specifics
			url : '/section_item_delete_ajax/'
		    });
		//
		itemsDelete.init();
		//
		// @initDEC  || @DEC
		// Initialize the decorate module in the 
		decorateDoing = $.modules.DecorateControls().init();
		//
		return IDR;
		//
	    };

	    return IDR;
	} // IDR Object



	/*
	 * call the doings Edit bar
	 *
	 * @ectionsEditMode
	 * @SEM
	 *
	 */

	var SectionsEditMode = function(){
	    //
	    var SEM = OAT({
		    isModeOn : false,
		    editButtonId : 'editBarTrigger',
		    editBarId : 'sectionsEditBar',
		    cancelEditId : 'cancelEditMode'
		}),
	    s = SEM.settings,
	    $doc = $(document);
	    //
	    SEM.refreshSettings = function() {
		//
		s.$editButton = $doc.find('#' + s.editButtonId );
		s.$editBar  = $doc.find( '#' + s.editBarId );
		s.$cancel = $doc.find( '#' + s.cancelEditId );
		//
		return SEM;
	    };


	    SEM.init = function(){
		//
		SEM.modeOn()
		//
	    };


	    SEM.modeOn = function(){
		//
		SEM
		//
		.refreshSettings()
		//
		.showEditButton()
		//
		.events.editButton.on()
		//
		.events.cancel.on();
		//
		s.isModeOn = true;
		//
		return SEM;
	    };


	    SEM.modeOff = function(){
		//
		SEM
		//
		.refreshSettings()
		//
		.hideEditButton()
		//
		.hideEditBar()
		//
		.events.editButton.off()
		//
		.events.cancel.off();
		//
		s.isModeOff = false;
		//
		return SEM;
	    };


	    // Event methods ------------------//


	    SEM.events = {
		//
		editButton :  {
		    //
		    on : function(){
			//
			s.$editButton.on( 'click' , function( e ) {
				//
				e.preventDefault();
				//
				SEM.showEditBar();
				//
				SEM.hideEditButton();
				//
			    });
			//
			return SEM;
			//
		    },
		    //
		    off : function(){
			//
			s.$editButton.off( 'click' );
			//
			return SEM;
			//
		    }
		},//editButton
		//
		cancel : {
		    //
		    on : function(){
			//
			s.$cancel.on( 'click' , function( e ){
				//
				e.preventDefault();
				//
				SEM.hideEditBar();
				//
				SEM.showEditButton();
				//
				return SEM;
				//
			    });
			//
			return SEM;
		    },
		    //
		    off : function(){
			//
			s.$cancel.off( 'click' );
			//
		    }
		}// cancel
		//
	    };// events


	    // ModeOn methods -------------------//


	    SEM.showEditButton = function() {
		//
		s.$editButton.removeClass( 'hidden' );
		//
		return SEM;
	    }


	    SEM.hideEditButton = function() {
		//
		s.$editButton.addClass( 'hidden' );
		//
		return SEM;
		//
	    };


	    // event reaction methods -----------//


	    SEM.showEditBar = function() {
		//
		s.$editBar.removeClass( 'hidden' );
		//
		return SEM;
	    };


	    SEM.hideEditBar = function() {
		//
		s.$editBar.addClass( 'hidden' );
		//
		return SEM;
	    };

	    return SEM;
	    //
	};// sectionEditMode




	/*
	 * Add items from library to a section
	 *
	 * @addItems
	 * @AI
	 *
	 */

	var AddItems = function(){
	    //
	    var AI = OAT({
		    isModeOn : false,
		    addTriggerId : 'addModeTrigger',
		    modalId : 'addItemsModal',
		    itemIdTags : 'data-item-id',
		    membershipTag : 'data-member-of-section-',
		    markerSecTag : 'data-marker-sec',
		    inactive : 'not-member',
		    endControls : 'data-end-controls="addItems"',
		    controlTypeTag : 'data-control-type'
		}),
	    s = AI.settings,
	    //
	    // define Settings that need other settings
	    $doc = $(document);
	    s.itemIdList = [];
	    s.$addTrigger =  $doc.find( '#' + s.addTriggerId );
	    s.$modal = $doc.find( '#' + s.modalId );
	    s.activeSection = $.contextVar.section_in_focus;
	    s.secItemCount = $.contextVar.sections[ s.activeSection ].section_item_count
	    //
	    // define this objects sub-sections
	    AI.events = {};

	    AI.init = function(){
		//
		s.$addTrigger.on( 'click', function(){
			//
			AI.modeOn();
			//
		    });
		//
		return AI;
		//
	    };

	    AI.modeOn = function() {
		//
		AI
		//
		.requestLibraryItems()
		//
		.callModal();
		//
		s.isModeOn = true;
		//
		return AI;
		//
	    };

	    AI.modeOff = function(){
		//
		AI
		//
		.closeModal()
		//
		.resetList();
		//
		s.isModeOn = false;
		//
		return AI;
		//
	    };


	    // functions for modeOff()---------------//

	    AI.resetList = function() {
		//
		s.itemIdList = new Array();
		//
		return AI;
	    }


	    AI.closeModal = function(){
		//
		s.$modal.trigger( 'reveal:close' );
		//
		return AI;
	    };


	    // functions for modeOn() forward---------------//

	    AI.requestLibraryItems = function(){
		//
		var ajaxSet = {
		    url : '/get_library_contents_in_section/',
		    type : 'POST',
		    data : { doing_id : $.contextVar.doing_id },
		    dataType: 'json',
		    success : function( result ){
			//
			AI
			//
			.renderLibraryItems( result )
			//
			.refreshVars()
			//
			.events.itemsOn()
			//
			.events.submitAndCancelOn();
			//
			// @initUploadModal
			// @initUM
			// activate the upload Button and its functions
			// from the upload Modal subclass
			s.uploadModal = UploadModal().init();
		    }
		};
		//
		AI.helper.ajaxRequest( ajaxSet );
		//
		return AI;
	    };


	    AI.renderLibraryItems = function( result ){
		//
		AI.helper
		.setTemplateIds( 'addItems' )
		.refreshTemplate( result );
		//
		return AI;
	    };


	    AI.refreshVars = function(){
		//
		$doc = $(document);
		s.$modal = $doc.find( '#' + s.modalId );
		s.$items = s.$modal.find( '[' + s.itemIdTags + ']' );
		s.$endControls =  $doc.find( '[' + s.endControls + ']' );
		s.activeSection = $.contextVar.section_in_focus;
		//
		return AI;
	    };


	    AI.callModal = function(){
		//
		s.$modal.reveal({
			closeOnBackgroundlick : false
		    });
		//
		return AI;
	    };


	    AI.events.itemsOn = function(){
		//
		s.$items.on( 'click' , function(e){
			e.preventDefault();
			//
			//save this item
			s.$item = $(this);
			//
			// cancel actions if item is in section
			if ( AI.isMarkerActive()
			     &&
			     AI.isIdInList().answer  === false ) {
			    //
			    return false;
			}
			//
			AI
			//
			.toggleMarker()
			//
			.toggleToIdList()
			//
			.changeMembership();
			//
		    });
		//
		return AI;
	    };


	    AI.isMarkerActive = function(){
		//
		var isItemInSection,
		itemMembershipTag = s.$item.attr( s.membershipTag + s.activeSection );
		//
		if ( itemMembershipTag === 'true' ){
		    //
		    isItemInSection = true;
		    //
		} else if ( itemMembershipTag === 'false' ){
		    //
		    isItemInSection = false;
		    //
		}
		//
		return isItemInSection;
	    };


	    AI.isIdInList = function(){
		//
		var listSize  = s.itemIdList.length,
		itemId = s.$item.attr( s.itemIdTags );
		//
		for(var i=0; i<listSize; i++){
		    //
		    if ( s.itemIdList[i] === itemId ){
			//
			return {
			    iterator : i,
				answer : true
				}
			//
		    }
		    //
		};//for
		//
		return {
		    iterator : 0,
			answer : false
			};
	    };


	    AI.toggleMarker = function(){
		//
		// save the marker element corresponding to the current section
		s.$memMarker =
		s.$item.find( '['+ s.markerSecTag + '=' + s.activeSection +']' );
		//
		// toggle marker
		AI.isMarkerActive()? AI.hideMarker() : AI.showMarker() ;
		//
		return AI;
	    };


	    AI.showMarker = function(){
		//
		s.$memMarker.removeClass( s.inactive );
		//
		return AI;
	    };


	    AI.hideMarker = function(){
		//
		s.$memMarker.addClass( s.inactive );
		//
		return AI;
	    };


	    AI.changeMembership = function(){
		//
		var reversedBool = AI.isMarkerActive() ? false : true;
		//
		// reverse the boolean on the data tag
		s.$item.attr( s.membershipTag + s.activeSection ,
			      reversedBool  );
		//
		return AI;
	    };


	    AI.toggleToIdList = function(){
		//
		var itemId = s.$item.attr( s.itemIdTags ),
		listSize  = s.itemIdList.length,
		index;
		//
		//if not in list --> push
		if ( AI.isMarkerActive() === false ){
		    //
		    // add id to the list
		    s.itemIdList.push( itemId );
		    //
		} else {
		    //
		    if ( AI.isIdInList().answer ){
			//
			index = AI.isIdInList().iterator;
			//
			s.itemIdList.splice( index , 1);
			//
			return AI;
		    }
		};
		//
		return AI;
	    };


	    // submit and Cancel (end events) functions-----------//

	    AI.events.submitAndCancelOn = function(){
		//
		s.$endControls
		.on( 'click', '[' + s.controlTypeTag + ']' , function(){
			//
			// save Trigger
			s.$endTrigger = $(this);
			//
			AI.controlsHandler();
			//
		    });
		//
		return AI;
	    };


	    AI.controlsHandler = function(){
		//
		var type = s.$endTrigger.attr( s.controlTypeTag );
		//
		if( type === 'submit' ){
		    //
		    AI.submitRequest();
		    //
		} else if ( type === 'cancel' ){
		    //
		    AI.cancelAdd();
		    //
		}
		//
		return AI;
	    };


	    AI.submitRequest = function(){
		//
		var data = {
		    doing_id : $.contextVar.doing_id,
		    section_id : $.contextVar.sections[ s.activeSection ].section_id ,
		    section_item_count : s.secItemCount,
		    added_item_ids : s.itemIdList
		};
		//
		var ajaxSet = {
		    url : '/put_items_into_section/',
		    method : 'POST',
		    data : data ,
		    success : function( result ){
			//
			AI
			//
			.refreshContextVar( result )
			//
			.refreshDoingInfo()
			//
			.refreshSections()
			//
			.modeOff();
		    },
		    scope : AI,
		}
		//
		AI.helper.ajaxRequest( ajaxSet );
		//
		return AI;
	    };


	    AI.refreshContextVar = function( result ){
		//
		$.contextVar = $.extend( $.contextVar , result );
		//
		return AI;
	    };


	    AI.refreshDoingInfo = function(){
		//
		AI.helper
		//
		.setTemplateIds( 'doingInfo' )
		//
		.refreshTemplate();
		//
		return AI;
	    };


	    AI.refreshSections = function(){
		//
		AI.helper
		//
		.setTemplateIds( 'sections' )
		//
		.refreshTemplate();
		//
		return AI;
	    };


	    AI.cancelAdd = function(){
		//
		AI.modeOff();
		//
		return AI;
	    };


	    return AI;
	    //
	}; // end AddItem App

	/*
	 * @uploadModal
	 * @UM
	 * subTemplate for the AddItems
	 */
	var UploadModal = function(){
	    //
	    var UM = OAT({
		    isModeOn : false,
		    uploadButtonId : 'uploadModalTrigger',
		    uploadModalId : 'uploadModalContainer',
		    imgButtonId : 'imgUploadTrigger',
		    vidButtonId : 'vidUploadTrigger',
		    closeButtonId : 'closeModalTrigger',
		    // invisible input forms
		    imgInputId : 'imgUploadInput',
		    vidInputId : 'vidUploadInput',
		    submitTags : 'data-auto-submit',
		    imgSubmitVal : 'modalImageSubmit',
		    vidSubmitVal : 'modalVideoSubmit'
		}),
	    s = UM.settings,
	    $doc = $(document);
	    //
	    s.$uploadButton = $doc.find( '#' + s.uploadButtonId );
	    s.$uploadModal = $doc.find( '#' + s.uploadModalId );
	    s.$imgButton = s.$uploadModal.find( '#' + s.imgButtonId );
	    s.$vidButton = s.$uploadModal.find( '#' + s.vidButtonId );
	    s.$closeUploadButton = s.$uploadModal.find( '#' + s.closeButtonId );
	    s.$imgInput = $doc.find( '#' + s.imgInputId );
	    s.$vidInput = $doc.find( '#' + s.vidInputId );
	    s.$uploadSubmits = $doc.find( '[' + s.submitTags + ']' );
	    s.$imgSubmit = s.$uploadSubmits.filter( '[' + s.submitTags + '=' +
						    s.imgSubmitVal + ']' );
	    s.$vidSubmit = s.$uploadSubmits.filter( '[' + s.submitTags + '=' +
						    s.vidSubmitVal + ']' );


	    UM.init = function(){
		//
		UM
		//
		.events.uploadButton.on()
		//
		return UM;
	    };


	    UM.modeOn = function(){
		//
		UM
		//
		.showUploadModal()
		//
		.events.imageButton.on()
		//
		.events.videoButton.on()
		//
		.events.closeButton.on()
		//
		.events.submitUpload.on( 'img' )
		//
		.events.submitUpload.on( 'vid' );
		//
		s.isModeOff = true;
		//
		return UM;
	    };


	    UM.modeOff = function(){
		//
		UM
		//
		.hideUploadModal()
		//
		.events.imageButton.off()
		//
		.events.videoButton.off()
		//
		.events.closeButton.off()
		//
		.events.submitUpload.off();
		//
		s.isModeOn = false;
		//
		return UM;
	    };


	    UM.showUploadModal = function() {
		//
		s.$uploadModal.removeClass( 'hidden' );
		//
		return UM;
	    };


	    UM.hideUploadModal = function(){
		//
		s.$uploadModal.addClass( 'hidden' );
		//
		return UM;
	    };


	    UM.events = {
		//
		uploadButton : {
		    on : function(){
			//
			s.$uploadButton.on( 'click' , function(){
				//
				UM.modeOn();
				//
			    });
			//
			return UM;
		    },
		    off : function(){
			//
			s.$uploadButton.off( 'click' );
			//
			return UM;
		    },
		},// upload button


		imageButton : {
		    on : function(){
			//
			s.$imgButton.on( 'click' , function(){
				//
				UM.triggerImgInput()
				//
			    });
			//
			return UM;
		    },
		    off : function(){
			//
			s.$imgButton.off( 'click' );
			//
			return UM;
		    }
		}, // imageButton


		videoButton : {
		    on : function(){
			//
			s.$vidButton.on( 'click' , function(){
				//
				UM.triggerVidInput();
				//
			    });
			//
			return UM;
		    },
		    off : function(){
			//
			s.$vidButton.off( 'click' );
			//
			return UM;
		    }
		}, // videoButton


		closeButton : {
		    on : function(){
			//
			s.$closeUploadButton.on( 'click' , function(){
				//
				UM.modeOff();
				//
			    });
			//
			return UM;
		    },
		    off : function(){
			//
			s.$closeUploadButton.off( 'click' );
			//
			return UM
		    }
		}, // closeButton


		submitUpload : {
		    on : function( input ){
			//
			var $input,
			$submit;
			//
			switch( input ){

			case 'img' :
			    //
			    $input = s.$imgInput;
			    //
			    $submit = s.$imgSubmit;
			    //
			    break;

			case 'vid' :
			    //
			    $input = s.$vidInput;
			    //
			    $submit = s.$vidSubmit;
			    //
			    break;
			}
			//
			// Submit after a file has been chosen
			$input.on( 'change' , function(){
				//
				$submit.trigger( 'submit' );
				//
			    });
			//
			return UM;
			//
		    },
		    off : function(){
			//
			s.$uploadSubmits.off( 'change' );
			//
			return UM;
		    }
		}//submitUpload
	    };// events


	    UM.triggerImgInput = function(){
		//
		s.$imgInput.trigger( 'click' );
		//
		return UM;
	    };


	    UM.triggerVidInput = function(){
		//
		s.$vidInput.trigger( 'click' );
		//
		return UM;
	    };

	    return UM;
	    //
	}; // uploadModal app




	/*
	 * @CoverChange
	 * @CC
	 *
	 */

	var CoverChange  = function(){
	    //
	    // object and its settings
	    var CC = OAT({
		    isModeOn : false,
		    modeTriggerId : 'coverModeTrigger',
		    itemIdTags : 'data-item-id',
		    iconContainerTags : 'data-cover-icon-container',
		    iconTag : 'data-cover-icon',
		    bgCoverIdTag : 'data-item-id-of-cover',
		    bgCoverSecIdTag : 'data-section-id-of-cover',
		    isCoverModeOn : 'false',
		    coverFooterId : 'coverModeFooter',
		    doneButtonId : 'coverModeOffButton',
		    bgToggleId : 'bgToggle'
		}),
	    s = CC.settings,
	    $doc = $(document);
	    //
	    // define settings that need other settings
	    s.$modeTrigger = $doc.find( '#' + s.modeTriggerId );
	    s.$items = $doc.find( '[' + s.itemIdTags + ']' );
	    s.reqData = {
		is_background_on : $.contextVar.is_background_on,
		doing_id : $.contextVar.doing_id,
		new_cover_item_id : $.contextVar.doing_cover.item_id_of_cover
	    };
	    //
	    // for use after templates render or refresh
	    CC.refreshSettings = function(){
		//
		s.$modeTrigger = $doc.find( '#' + s.modeTriggerId );
		s.$items = $doc.find( '[' + s.itemIdTags + ']' );
		s.$coverIcons = s.$items.find( '[' + s.iconContainerTags + ']' );
		s.$bgCovers = $doc.find( '[' + s.bgCoverIdTag + ']' );
		s.$coverFooter = $doc.find( '#' + s.coverFooterId );
		s.$doneButton = s.$coverFooter.find( '#' + s.doneButtonId );
		s.$BGToggle = s.$coverFooter.find( '#' + s.bgToggleId );
		//
		return CC;
	    };

	    CC.init = function(){
		//
		CC.setActiveIcon();
		//
		// set up the modes main click event
		s.$modeTrigger.on( 'click' , function(){
			//
			CC
			//
			.refreshSettings()
			//
			.handleMode();
			//
		    });
		//
		return CC;
	    };


	    CC.setActiveIcon = function(){
		//
		var coverId = $.contextVar.doing_cover.item_id_of_cover;
		//
		// look thru the items
		s.$activeCoverIcon = s.$items
		//
		// search for the item currently selected as cover
		.filter( '[' + s.itemIdTags + '=' + coverId + ']')
		//
		// go down to its icon tag
		.find( '[' + s.iconTag + ']' );
		//
		// change to active
		s.$activeCoverIcon.attr( s.iconTag , 'active' );
		//
		return CC;
	    };


	    CC.handleMode = function(){
		//
		if( s.isModeOn ){
		    //
		    CC.modeOff();
		    //
		} else {
		    //
		    CC.modeOn();
		    //
		}
		//
		return CC;
		//
	    };



	    CC.modeOn = function(){
		//
		CC
		//
		.showIconContainers()
		//
		.showActiveCoverIcon()
		//
		.showCoverFooter()
		//
		.events.itemsOn()
		//
		.events.doneButtonOn()
		//
		s.isModeOn = true;
		//
		return CC;
	    };



	    CC.modeOff = function(){
		//
		CC
		//
		.hideIconContainers()
		//
		.hideActiveCoverIcon()
		//
		.hideCoverFooter()
		//
		.events.itemsOff()
		//
		.events.doneButtonOff()
		//
		s.isModeOn = false;
		//
		return CC;
	    };



	    // Mode On methods ------------------------//


	    CC.showIconContainers = function() {
		//
		s.$coverIcons.removeClass( 'hidden' );
		//
		return CC;
		//
	    };


	    CC.showActiveCoverIcon = function(){
		//
		s.$activeCoverIcon.removeClass( 'hidden' );
		//
		return CC;
	    };


	    CC.showCoverFooter = function(){
		//
		s.$coverFooter.removeClass( 'hidden' );
		//
		return CC;
	    };


	    // Event methods ------------------------//


	    CC.events = {


		itemsOn : function(){
		    //
		    s.$items.on( 'click' , function( e ){
			    //
			    e.preventDefault();
			    //
			    // store the $scope element
			    s.itemTrigger = $(this);
			    //
			    CC
			    //
			    .switchCovers
			    //
			    .switchData()
			    //
			    .switchIconAndElements()
			    //
			});
		    //
		    return CC;
		},


		itemsOff : function(){
		    //
		    s.$items.off( 'click' );
		    //
		    return CC;
		},


		doneButtonOn : function(){
		    //
		    s.$doneButton.on( 'click' , function() {
			    //
			    CC
			    //
			    .requestCoverChange()
			    //
			    .modeOff();
			    //
			});
		    //
		    return CC;
		},


		doneButtonOff : function(){
		    //
		    s.$doneButton.off( 'click' );
		    //
		    return CC;
		}
	    };// events



	    // Mode Off methods ------------------//


	    CC.hideIconContainers = function(){
		//
		s.$coverIcons.addClass( 'hidden' );
		//
		return CC;
	    };


	    CC.hideActiveCoverIcon = function(){
		//
		s.$activeCoverIcon.addClass( 'hidden' );
		//
		return CC;
	    };


	    CC.hideCoverFooter = function(){
		//
		s.$coverFooter.addClass( 'hidden' );
		//
		return CC;
	    };



	    // item click reaction methods --------//

	    CC.switchCovers = {

		switchData : function(){
		    //
		    // grab the new cover data
		    var newCoverId =  parseInt( s.itemTrigger.attr( s.itemIdTags ) ),
		    newCoverSecId = $.contextVar.section_in_focus,
		    newCoverSrc,
		    itemsList = $.contextVar.sections[newCoverSecId].section_items;
		    //
		    //
		    CC.refreshSettings();
		    //
		    // grab the src of the cover from the contextVar
		    for( var i=0; i<itemsList.length; i++ ){
			//
			if( itemsList[i].item_id ===  newCoverId ){
			    //
			    // grab the src without the /media/ tag
			    newCoverSrc = itemsList[i].item_thumbnail;
			    //
			};
		    };
		    //
		    // Save the reqData tp send by ajax
		    s.reqData.doing_id = $.contextVar.doing_id,
		    s.reqData.new_cover_item_id =  newCoverId;
		    //
		    //Apply it to the contextVar
		    $.contextVar.doing_cover = {
			cover_thumbnail : newCoverSrc,
			item_id_of_cover : newCoverId
		    };
		    //
		    //
		    return this;
		    //
		},


		switchIconAndElements :  function(){
		    //
		    CC
		    //
		    .hideActiveCoverIcon()
		    //
		    .refreshSettings()
		    //
		    .setActiveIcon()
		    //
		    .showActiveCoverIcon();
		    //
		    return CC;
		}
	    };


	    CC.requestCoverChange = function(){
		//
		var ajaxSet = {
		    url : '/doing_cover_change_ajax/',
		    type : 'POST',
		    data : s.reqData,
		};
		//
		CC.helper.ajaxRequest( ajaxSet );
		//
		return CC;
	    };


	    // @bg adjust methods -----------------//

	    /*
	    CC.setBGCheckBox = function() {
		//
		var checked;
		//
		if( $.contextVar.is_background_on ){
		    //
		    checked = true;
		    //
		} else {
		    //
		    checked = false;
		    //
		};
		//
		s.$BGToggle.prop( 'checked', checked );
		//
		return CC;
	    };



	    CC.refreshBackground = function(){
		//
		$.contextVar.is_background_on = s.isBGBoxChecked;
		//
		CC
		//
		.saveBGReqData()
		//
		.helper
		//
		.setTemplateIds( 'background' )
		.refreshTemplate();
		//
		return CC;
		//
	    };


	    CC.saveBGReqData = function(){
		//
		if( !s.reqData ){
		    s.reqData = {}
		};
		//
		s.reqData.is_background_on =
		$.contextVar.is_background_on;
		//
		return CC;
		//
	    };
	    */

	    // return the CoverChange object  Template
	    return CC;
	    //
	}; // end of CoverChange App



	/*
	 * @sortItems
	 * @SI
	 *
	 */

	var SortItems = function(){

	    var SI = OAT({
		    isModeOn : false,
		    sortButtonId : 'sortModeTrigger',
		    sortFooterId : 'sortModeFooter',
		    itemsContainerTag : 'data-items-container',
		    itemIdTag : 'data-item-id',
		    sortIconTags : 'data-sort-icon',
		    saveId : 'sortSave',
		    cancelId : 'cancelSort',
		    sectionTag : 'data-section',
		    shrinkClass : 'shrink-for-sort'
		}),
	    s = SI.settings,
	    $doc = $(document);
	    //
	    // initial elements
	    s.$sortButton = $doc.find( '#' + s.sortButtonId );
	    //
	    SI.refreshSettings = function(){
		//
		//
		var thisSection = $.contextVar.section_in_focus,
		thisSectionsTag = '[' + s.sectionsTag + '=' + thisSection + ']';
		//
		$doc = $(document);
		s.$sortFooter = $doc.find( '#' + s.sortFooterId );
		s.$section = $doc.find( '[' + s.sectionTag + '=' + thisSection +']' );
		s.$itemsContainer = s.$section.find( '[' + s.itemsContainerTag + ']' );
		s.$items = s.$itemsContainer.find( '[' + s.itemIdTag + ']' );
		s.$sortIcons = s.$items.find( '[' + s.sortIconTags + ']' );
		s.$saveButton = s.$sortFooter.find( '#' + s.saveId );
		s.$cancelButton = s.$sortFooter.find( '#' + s.cancelId );
		s.$sectionsNotFocused = $doc.find( '[' + s.sectionsTag + ']' )
		.not( thisSectionsTag );
		//
		return SI;
		//
	    };


	    SI.init = function(){
		//
		s.$sortButton.on( 'click' , function(){
			//
			SI
			//
			.modeOn();
			//
		    });
		//
		return SI;
	    };


	    SI.modeOn = function(){
		//
		sectionCarousel.settings.stopCarousel = true;
		//
		SI
		//
		.refreshSettings()
		//
		.shrinkItems()
		//
		.showIcons()
		//
		.makeItemsSortable()
		//
		.showFooter()
		//
		.events.saveButtonOn()
		//
		.events.cancelButtonOn();
		//
		s.isModeOn = true;
		//
		return SI;
		//
	    };


	    SI.modeOff = function(){
		//
		sectionCarousel.settings.stopCarousel = false;
		//
		SI
		//
		.hideIcons()
		//
		.returnItemsToSize()
		//
		.removeSortable()
		//
		.hideFooter()
		//
		.events.saveButtonOff()
		//
		.events.cancelButtonOff();
		//
		s.isModeOn = false;
		//
		return SI;
		//
	    };


	    // modeOn method flow --------- //


	    SI.shrinkItems = function() {
		//
		SI.helper
		//
		.attatchAnimate( s.$items );
		//
		s.$items.addClass( s.shrinkClass );
		//
		window.setTimeout( function(){
			//
			SI.helper
			    //
			    .detatchAnimate( s.$items );
			//
		    }, 2000 );
		//
		return SI
	    };


	    SI.hideUnfocusedSections = function(){
		//
		s.$sectionsNotFocused.addClass( 'hidden' );
		//
		return SI;
	    };


	    SI.showIcons = function() {
		//
		s.$sortIcons.removeClass( 'hidden' );
		//
		return SI
	    };


	    SI.showFooter = function(){
		//
		s.$sortFooter.removeClass( 'hidden' );
		return SI;
		//
	    };


	    SI.makeItemsSortable = function() {
		//
		s.$itemsContainer.sortable();
		s.$itemsContainer.disableSelection();
		//
		return SI;
		//
	    }


	    // modeOff method flow -------- //


	    SI.hideIcons = function() {
		//
		s.$sortIcons.addClass( 'hidden' );
		//
		return SI;
	    };


	    SI.showUnfocusedSections = function(){
		//
		s.$sectionsNotFocused.removeClass( 'hidden' );
		//
		return SI;
	    };


	    SI.returnItemsToSize = function() {
		//
		SI.helper
		//
		.attatchAnimate( s.$items );
		//
		s.$items.removeClass( s.shrinkClass );
		//
		window.setTimeout( function(){
			//
			SI.helper
			    //
			    .detatchAnimate( s.$items );
			//
		    }, 2000 );
		//
		return SI
	    };


	    SI.hideFooter = function() {
		//
		s.$sortFooter.addClass( 'hidden' );
		//
		return SI;
	    }


	    SI.removeSortable = function() {
		//
		s.$itemsContainer.sortable( "destroy" );
		//
		return SI;
		//
	    }


	    // events --------------------- //
	    SI.events = {
		//
		saveButtonOn : function(){
		    //
		    s.$saveButton.on( 'click' , function() {
			    //
			    SI
			    //
			    .storePositionsAndData()
			    //
			    .sendSaveRequest()
			    //
			    .modeOff();
			    //
			});
		    //
		    return SI;
		},
		//
		saveButtonOff : function(){
		    //
		    s.$saveButton.off( 'click' );
		    //
		    return SI;
		    //
		},
		//
		cancelButtonOn : function() {
		    //
		    s.$cancelButton.on( 'click' , function(){
			    //
			    SI.modeOff();
			    //
			});
		    //
		    return SI;
		    //
		},
		//
		cancelButtonOff :  function() {
		    //
		    s.$cancelButton.off( 'click' );
		    //
		    return SI;
		}
	    }; // end events


	    // submit reactions ------------ //

	    SI.storePositionsAndData = function(){
		//
		SI.refreshSettings();
		//
		var itemIds  = new Array(),
		//
		// get the section id from the section in focus
		sectionInFocus = $.contextVar.section_in_focus,
		sectionId = $.contextVar.sections[sectionInFocus].section_id;
		//
		// store the positions by using $ to traverse the dom after deletion
		for( var i=0; i<s.$items.length; i++ ){
		    //
		    itemIds[i] = $( s.$items[i] ).attr( s.itemIdTag );
		    //
		}
		s.reqData = {
		    doing_id : $.contextVar.doing_id,
		    section_id : sectionId,
		    item_ids_in_order : itemIds
		};
		//
		return SI;
	    };

	    SI.sendSaveRequest = function() {
		//
		var ajaxSet = {
		    url : '/section_item_change_position_ajax/',
		    type : 'POST',
		    data : s.reqData,
		    dataType : 'html',
		    success : function() {
			//
			SI.helper
			//
			.showSaved();
			//
		    }
		};
		//
		SI.helper
		//
		.ajaxRequest( ajaxSet );
		//
		return SI;
	    };


 	    // return Sort Items Object Template
	    return SI;
	};

	/*
	 * @doingInfoEdit
	 * @DIE
	 *
	 *
	 */

	var DoingInfoEdit = function() {
	    //
	    var DIE = OAT({
		    isModeOn : false,
		    editButtonId : 'editInfoModeOn',
		    nameInputId : 'doingNameInput',
		    descTextareaId : 'doingDescTextarea',
		    deleteDoingButtonId : 'deleteDoingButton',
		    submitButtonId : 'saveDoingEdit',
		    cancelButtonId : 'cancelDoingEdit'
		}),
	    s = DIE.settings,
	    $doc = $( document ),
	    regionId = DIE.helper.getTemplateIdsOf( 'doingInfo' ).target;
	    //
	    DIE.refreshSettings = function(){
		//
		$doc = $(document);
		s.$codeRegion = $doc.find( '#' + regionId );
		s.$editButton = $doc.find( '#' + s.editButtonId );
		s.$nameInput = s.$codeRegion.find( '#' + s.nameInputId );
		s.$descTextarea = s.$codeRegion.find( '#' + s.descTextareaId );
		s.$submitButton = s.$codeRegion.find( '#' + s.submitButtonId );
		s.$cancelButton = s.$codeRegion.find( '#' + s.cancelButtonId );
		//
		return DIE;
	    };


	    DIE.init = function(){
		//
		DIE.refreshSettings();
		//
		//
		s.$editButton.on( 'click' , function(){
			//
			DIE.modeOn();
			//
		    });
		//
		return DIE;
	    };


	    DIE.modeOn = function(){
		//
		DIE.helper
		//
		.setTemplateIds( 'doingInfoEdit' )
		//
		.refreshTemplate();
		//
		DIE
		//
		.refreshSettings()
		//
		.hideEditButton()
		//
		.events.submit.on()
		//
		.events.cancel.on();
		//
		deleteDoing = DeleteDoing().init();
		//
		s.isModeOn = true;
		//
		return DIE;
	    };


	    DIE.modeOff = function(){
		//
		DIE.helper
		//
		.setTemplateIds( 'doingInfo' )
		//
		.refreshTemplate();
		//
		DIE
		//
		.refreshSettings()
		//
		.showEditButton()
		//
		.events.submit.off()
		//
		.events.cancel.off();
		//
		s.isModeOn = false;
		//
		return DIE;
	    };

	    // modeOn methods ------------------//

	    DIE.hideEditButton = function(){
		//
		s.$editButton.addClass( 'hidden' );
		//
		return DIE;
	    };

	    // modeOff methods ---------------//

	    DIE.showEditButton = function(){
		//
		s.$editButton.removeClass( 'hidden' );
		//
		return DIE;
	    };

	    // events methods -----------------//

	    DIE.events = {
		//
		submit : {
		    //
		    on : function(){
			//
			s.$submitButton.on( 'click' , function(){
				//
				DIE
				//
				.prepareRequestData()
				//
				.requestEdit();
				//
			    });
			//
			return DIE;
		    },
		    //
		    off : function(){
			//
			s.$submitButton.off( 'click' );
			//
			return DIE;
		    }
		},
		//
		cancel : {
		    //
		    on : function() {
			//
			s.$cancelButton.on( 'click' , function(){
				//
				DIE.modeOff();
				//
			    });
			//
			return DIE;
		    },
		    //
		    off : function(){
			//
			s.$cancelButton.off( 'click' );
			//
			return DIE;
		    }
		}
	    }


	    // submit reactions --------------//

	    DIE.prepareRequestData = function() {
		//
		s.reqData = {
		    doing_id : $.contextVar.doing_id,
		    new_title : s.$nameInput.val(),
		    new_description : s.$descTextarea.val()
		};
		return DIE;
	    }

	    DIE.requestEdit = function() {
		//
		DIE.helper.ajaxRequest({
			url : '/doing_edit_title_description/',
			type : 'POST',
			dataType : 'html',
			data : s.reqData,
			scope : DIE,
			success : function(){
			    //
			    DIE
			    //
			    .updateInfo()
			    //
			    .modeOff();
			    //
			}
		    });
		//
		return DIE;
	    };


	    DIE.updateInfo = function(){
		//
		$.contextVar.doing_title = s.reqData.new_title;
		//
		$.contextVar.doing_description = s.reqData.new_description;
		//
		return DIE;
	    };


	    return DIE;
	    //
	}// doingInfoEdit app


	/*
	 * @deleteDoing
	 * @DD
	 * initialized inside the doingInfo Edit app modeOn() function
	 *
	 */

	var DeleteDoing = function(){
	    //
	    var DD = OAT({
		    deleteModalTriggerId : 'doingDeleteModalTrigger',
		    hiddenInputId : 'doingIdCarrier',
		    deleteModalId : 'doingDeleteModal',
		}),
	    s = DD.settings,
	    $doc = $(document);
	    //
	    s.$modalTrigger = $doc.find( '#' + s.deleteModalTriggerId );
	    s.$idCarrier = $doc.find( '#' + s.hiddenInputId );
	    s.$deleteModal = $doc.find( '#' + s.deleteModalId );

	    DD.init = function() {
		//
		s.$modalTrigger.on( 'click' , function(){
			//
			DD
			//
			.setDoingIdCarrier()
			//
			.callDeleteModal()
			//
			.events.cancel.on();
			//
		    });
		//
		return DD;
	    };

	    DD.setDoingIdCarrier = function() {
		//
		var doingId = $.contextVar.doing_id;
		//

		s.$idCarrier.val(doingId);
		//
		return DD;
	    };


	    DD.callDeleteModal = function() {
		//
		s.$deleteModal.reveal();
		//
		return DD;
	    };


	    DD.events = {
		//
		cancel : {
		    //
		    on : function() {
			//
			s.$cancelButton.on( 'click' , function(){
				//
				DD
				//
				closeDeleteModal()
				//
				.events.cancel.off();
				//
			    });
			//
			return DD;
		    },
		    //
		    off : function() {
			//
			s.$cancelButton.off( 'click' );
			//
			return DD;
		    }
		}
	    };

	    return DD;
	    //
	}; // deleteDoing app


	/*
	 * @doingPullDown
	 * @DPD
	 *
	 */
	var DoingPullDown = function(){
	    //
	    var DPD = OAT({
		    state : 'sections', // default start for now
		    //
		    // tags and ids
		    doingTitleId : "doingPullDownTrigger",
		    //
		    // STYLE CLASSES
		    doingHidden : 'hide-doing',
		    sectionsHidden : 'hide-sections',
		}),
	    s = DPD.settings,
	    $doc = $(document);
	    //
	    s.doingInfoId = DPD.helper.getTemplateIdsOf( 'doingInfo' ).target;
	    s.sectionsId = DPD.helper.getTemplateIdsOf( 'sections' ).target;


	    DPD.refreshSettings = function() {
		//
		s.$doingTitle = $doc.find( '#' + s.doingTitleId );
		s.$doingInfoContainer = $doc.find( '#'+ s.doingInfoId );
		s.$sectionsContainer = $doc.find( '#' + s.sectionsId );
		//
		return DPD;
		//
	    };


	    DPD.init =  function(){
		//
		DPD
		//
		.refreshSettings()
		//
		.sections.switchIn();
		//
		return DPD;
	    };


	    DPD.doingInfo = {
		//
		state : {
		    //
		    on : function(){
			//
			s.$doingInfoContainer.removeClass( s.doingHidden );
			//
			// if DIE App exist
			if( doingInfoEdit ) {
			    //
			    doingInfoEdit.showEditButton();
			    //
			}
			//
			s.$sectionsContainer.hammer()
			//
			.on( 'swipeUp click' , function(){
				//
				DPD.sections.switchIn();
				//
			    });
			//
			return DPD;
			//
		    },
		    //
		    off : function() {
			//
			s.$doingInfoContainer.addClass( s.doingHidden );
			//
			// if DIE App exist
			if( doingInfoEdit ) {
			    //
			    doingInfoEdit.hideEditButton();
			    //
			}
			//
			s.$sectionsContainer.off( 'click' );
			//
			return DPD;
			//
		    }
		}, //state
		//
		switchIn : function(){
		    //
		    DPD.helper.killAllEditModes();
		    //
		    DPD.doingInfo.state.on();
		    //
		    sectionsEditMode.modeOff();
		    //
		    doingInfoEdit.showEditButton();
		    //
		    DPD.sections.state.off();
		    //
		    s.state = 'doingInfo';
		    //
		    return DPD;
		    //
		}// switchIn
	    };//doingInfo


	    DPD.sections = {
		//
		state : {
		    //
		    on : function(){
			//
			s.$sectionsContainer.removeClass( s.sectionsHidden );
			//
			// apply hammer's gesture events to the object
			s.$doingTitle.hammer()
			//
			.on( 'swipeDown click' , function(){
				//
				DPD.doingInfo.switchIn();
				//
			    });
			//
			return DPD;
			//
		    },
		    //
		    off : function() {
			//
			s.$sectionsContainer.addClass( s.sectionsHidden );
			//
			s.$doingTitle.off( 'click' );
			//
			return DPD;
			//
		    },
		    //
		    //
		},// state
		//
		switchIn : function(){
		    //
		    DPD.helper.killAllEditModes();
		    //
		    DPD.sections.state.on();
		    //
		    sectionsEditMode.modeOn();
		    //
		    DPD.doingInfo.state.off();
		    //
		    s.state = 'sections';
		    //
		    return DPD
		    //
		}// switchIn
		//
	    };//sections


	    return DPD;
	    //
	}; // doingpulldown



	/*
	 * controls the nav dots for as many sections available
	 *
	 * @navMarkers
	 * @NAVM
	 *
	 */

	var NavMarkers = function(){
	    //
	    var NAVM = OAT({
		    containerId : "navMarkerContainer",
		    markerTag : "data-nav-marker",
		    focusedClass : "focused-dot"
		}),
	    s = NAVM.settings,
	    $doc = $(document);
	    //
	    NAVM.refreshSettings = function(){
		//
		s.$markerContainer = $doc.find( '#' + s.containerId );
		s.$markers = s.$markerContainer.find( '[' + s.markerTag + ']' );
		//
		return NAVM;
	    }

	    NAVM.updateFocusedMarker = function( section ){
		//
		s.section = section || 0;
		//
		NAVM
		//
		.refreshSettings()
		//
		.removeAllFocusedClasses()
		//
		.addFocus();
		//
		return NAVM;
	    };

	    NAVM.removeAllFocusedClasses = function(){
		//
		s.$markers.removeClass( s.focusedClass );
		//
		return NAVM;
	    };

	    NAVM.addFocus = function(){
		//
		s.$markers
		.filter( '[' + s.markerTag + '=' + s.section +']' )
		.addClass( s.focusedClass );
		//
		return NAVM;
	    };

	    return NAVM;
	    //
	};


	/*
	 * PLUGIN object
	 * @carousel app -----------------------------------------------------
	 *
	 * written by the Hammer.js Team
	 *
	 */
	//
	// @CAROUSEL start
	// @sectionsCarousel
	// @SC
	//
	var $doc = $(document);
	//
	/**
	 * simple carousel
	 * animation between panes happens with css transitions
	 */
	var Carousel = function(element){
	    var self = this;
	    element = $doc.find(element);
	    //
	    var container = $(">ul", element),
	    panes = $(">ul>li", element),
	    pane_width = 0,
	    pane_count = panes.length,
	    current_pane = 0;
	    //
	    // create settings to alter the Carousel Obj from outside
	    this.settings = {
		stopCarousel : false
	    }
	    //
	    this.init = function() {
		//
		setPaneDimensions();
		//
		// move to the section in focus
		this.showPane( $.contextVar.section_in_focus , true );
		//
		$(window).on("load resize orientationchange", function() {
			//
			setPaneDimensions();
			//
		    })
	    };

	    // set the pane dimensions and scale the container
	    function setPaneDimensions() {
		//
		pane_width = element.width();
		//
		panes.each(function() {
			//
			$(this).width(pane_width);
			//
		    });
		//
		container.width(pane_width*pane_count);
	    };


	    /**
	     * show pane by index
	     * param  {Number}    index
	     */
	    this.showPane = function( index ) {
		//
		// keeo the index between carousel bounds
		index = Math.max(0, Math.min(index, pane_count-1));
		//
		current_pane = index;
		//
		$.contextVar.section_in_focus = index;
		//
		// Change the NavDots classes
		navMarkers.updateFocusedMarker( index );
		//
		var offset = -((100/pane_count)*current_pane);
		//
		setContainerOffset(offset, true);
	    };


	    function setContainerOffset(percent, animate) {
		//
		container.removeClass("animate");
		//
		if(animate) {
		    container.addClass("animate");
		}
		//
		if(Modernizr.csstransforms3d) {
		    container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
		}
		//
		else if(Modernizr.csstransforms) {
		    container.css("transform", "translate("+ percent +"%,0)");
		}
		//
		else {
		    var px = ((pane_width*pane_count) / 100) * percent;
		    container.css("left", px+"px");
		}
	    }



	    this.next = function(outsidePane) {
		//
		// @paneChange
		//
		var nextPane,
		section;
		if(!outsidePane){
		    nextPane = current_pane+1,
			section = (current_pane+1)+1;
		} else {
		    nextPane = outsidePane,
		    section  = outsidePane + 1;
		}
		//
		//
		if ( sortItems ) {
		    //
		    if( sortItems.settings.isModeOn ){
			//
			sortItems.modeOff();
			//
		    }
		}
		//
		if( itemsDelete ){
		    //
		    if( itemsDelete.settings.isModeOn ){
			//
			itemsDelete.modeOff();
			//
		    }
		}


		//show next pane
		return this.showPane(nextPane, true);
	    };



	    this.prev = function(outsidePane) {
		//
		//@paneChange
		//
		var prevPane,
		section;

		if(!outsidePane){
		    prevPane = current_pane-1,
			section = (current_pane+1)-1;

		} else {
		    prevPane = outsidePane,
		    section  = outsidePane + 1;
		}
		//
		//
		if( sortItems.settings.isModeOn ){
		    //
		    sortItems.modeOff();
		    //
		};
		//
		if( itemsDelete.settings.isModeOn ){
		    //
		    itemsDelete.modeOff();
		    //
		}
		//
		//show Previous pane
		return this.showPane(prevPane, true);
	    };

	    this.toggleCarousel = function(){
		//
		if ( this.settings.stopCarousel ){
		    //
		    this.settings.stopCarousel = false;
		    //
		} else  {
		    //
		    this.settings.stopCarousel = true;
		    //
		}
	    };

	    function handleHammer(ev) {

		// disable browser scrolling
		ev.gesture.preventDefault();
		//
		//
		if ( self.settings.stopCarousel ) {
		    //
		    // leave early
		    return false;
		    //
		};
		//
		switch(ev.type) {
		case 'dragright':
		case 'dragleft':
		    // stick to the finger
		    var pane_offset = -(100/pane_count)*current_pane;
		    var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

		    // slow down at the first and last pane
		    if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
		       (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
			drag_offset *= .4;
		    }

		    setContainerOffset(drag_offset + pane_offset);
		    break;

		case 'swipeleft':
		    self.next();
		    ev.gesture.stopDetect();
		    break;

		case 'swiperight':
		    self.prev();
		    ev.gesture.stopDetect();
		    break;

		case 'release':
		    // more then 50% moved, navigate
		    if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
			if(ev.gesture.direction == 'right') {
			    self.prev();
			} else {
			    self.next();
			}
		    }
		    else {
			self.showPane(current_pane, true);
		    }
		    break;
		}

	    }


	    element.hammer({ drag_lock_to_axis: true })
	    .on("release dragleft dragright swipeleft swiperight", handleHammer);
	    //
	    return this;
   	}; // Carousel App


	/*
	 * @Start the doings
	 * @initIDR
	 *
	 */
	 initDoingRequest = InitDoingRequest().init();



    }); // main Anon Function