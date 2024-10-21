sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./StructuralSearch",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, StructuralSearch, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.untitledPrototype.controller.DynamicAssessment", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App65bcba2f9fe5d71f41decad6";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

			this.aRadioButtonGroupIds = [
				"sap_Responsive_Page_0-content-sap_m_ScrollContainer-1711617373644-content-sap_m_ScrollContainer-1711619630339-content-sap_m_VBox-2-items-sap_m_RadioButtonGroup-1"
			];
			this.handleRadioButtonGroupsSelectedIndex();

		},
		handleRadioButtonGroupsSelectedIndex: function() {
			var that = this;
			this.aRadioButtonGroupIds.forEach(function(sRadioButtonGroupId) {
				var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
				var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
				if (oButtonsBinding) {
					var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
					var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
					oButtonsBinding.attachEventOnce("change", function() {
						if (oSelectedIndexBinding) {
							oSelectedIndexBinding.refresh(true);
						} else {
							oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
						}
					});
				}
			});

		},
		_onPageNavButtonPress: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function(oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onButtonPress: function(oEvent) {

			var sDialogName = "StructuralSearch";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new StructuralSearch(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		convertTextToIndexFormatter: function(sTextValue) {
			var oRadioButtonGroup = this.byId(
				"sap_Responsive_Page_0-content-sap_m_ScrollContainer-1711617373644-content-sap_m_ScrollContainer-1711619630339-content-sap_m_VBox-2-items-sap_m_RadioButtonGroup-1"
			);
			var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
			if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
				// look up index in bound context
				var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
				return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function(
					oButtonContext) {
					return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
				});
			} else {
				// look up index in static items
				return oRadioButtonGroup.getButtons().findIndex(function(oButton) {
					return oButton.getText() === sTextValue;
				});
			}

		},
		_onRadioButtonGroupSelect: function() {

		},
		formatDateUTCtoLocale: function(dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		_onDateRangeSelectionChange: function(oEvent) {

			var oDateRangeSelection = oEvent.getSource();
			var oBindingContext = oDateRangeSelection.getBindingContext();
			var sBindingPathOfDateValue = oDateRangeSelection.getBindingPath("dateValue");
			var sBindingPathOfSecondDateValue = oDateRangeSelection.getBindingPath("secondDateValue");
			var oFrom = oEvent.getParameter("from");
			if (oBindingContext && sBindingPathOfDateValue && oFrom) {
				var oFromBefore = oBindingContext.getModel().getProperty(sBindingPathOfDateValue, oBindingContext);
				if (oFromBefore) {
					var oUTCFrom = new Date(Date.UTC(oFrom.getFullYear(), oFrom.getMonth(), oFrom.getDate(), oFromBefore.getUTCHours(), oFromBefore.getUTCMinutes(),
						oFromBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfDateValue, oUTCFrom, oBindingContext);
				}
			}
			var oTo = oEvent.getParameter("to");
			if (oBindingContext && sBindingPathOfSecondDateValue && oTo) {
				var oToBefore = oBindingContext.getModel().getProperty(sBindingPathOfSecondDateValue, oBindingContext);
				if (oToBefore) {
					var oUTCTo = new Date(Date.UTC(oTo.getFullYear(), oTo.getMonth(), oTo.getDate(), oToBefore.getUTCHours(), oToBefore.getUTCMinutes(),
						oToBefore.getUTCSeconds()));
					oBindingContext.getModel().setProperty(sBindingPathOfSecondDateValue, oUTCTo, oBindingContext);
				}
			}

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DynamicAssessment").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			
			// this.getOwnerComponent().getContentDensityClass()
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		//+kristian
		_onRouteToDietTypeAssignment: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DietTypeAssignment", {
				"Context": ""
			});
		},
		_onRouteToNutritionAssessment: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("NutritionAssessment", {
				"Context": ""
			});
		},
		_onRouteToNutritionEstimation: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("NutritionEstimationAndRecommendationi", {
				"Context": ""
			});
		},
		_onOpenAction: function(oEvent) {
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.sap.build.standard.untitledPrototype.view.fragment.UserActionButton",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
		}
	});
}, /* bExport= */ true);