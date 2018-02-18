// Define some global vars.
var owned = [];
var features = [];
var budget = "";
var standalone = "";
var remaining = pos;

var color = []

$(document).ready(function() {
	initApp();
});

initApp = function() {
	initListener();

    vpw = $(window).width();
    vph = $(window).height();

    $('.step').height(vph);
}

initListener = function() {
	$('#owned-step button').on('click', submitOwnedStep);
	$('#budget-step button').on('click', submitBudgetStep);
	$('#standalone-step button').on('click', submitStandaloneStep);
	$('#main-feature-step button').on('click', submitMainFeaturesStep);
	$('#intro button').on('click', showOwnedStep);
}

/**
 * Init the PO's list.
 */
initPosList = function() {
	for (var i in pos) {
		let markup = `
			<div  class="form-check">
				<input class="form-check-input" name="owned" id="owned${i}" type="checkbox" required value="${i}"/>
				<label class="form-check-label" for="owned${i}">
					${pos[i].name}
				</label>
			</div>
		`;
		$('#owned-po-div').append(markup);
	}
}

/**
 * Initialize the features list.
 */
initFeaturesList = function() {
	let _features = {};
	for (var i in remaining) {
		for (var j in remaining[i].main_features) {
			_features[remaining[i].main_features[j]] = remaining[i].main_features[j];
		}
	}

	for (var i in _features) {
		let markup = `
			<div  class="form-check">
				<input class="form-check-input" name="feature" id="feature-${i}" type="radio" value="${i}"/>
				<label class="form-check-label" for="feature-${i}">
					${_features[i]}
				</label>
			</div>
		`;

		$('#features-div').append(markup);
	}
	let markup = `
		<div  class="form-check">
			<input class="form-check-input" required name="feature" id="feature-none" type="radio" value="none@"/>
			<label class="form-check-label" for="feature-none">
				none of these
			</label>
		</div>
	`;
	$('#features-div').append(markup);
}

/**
 * Submit the first step "Owned PO"
 */
submitOwnedStep = function() {
	// Store the owned po.
	$("#owned-po-div input:checked").each(function() {
		owned.push($(this).val());
	});

	// Update the remaining object.
	for (var i in owned) {
		delete remaining[owned[i]];
	}

	// Display the next step if needed.
	if (!showResults()) {
		scrollToDiv('budget-step');
	}
	$("#owned-po-div input").prop("disabled", true);
}

submitBudgetStep = function() {
	budget = $('#budget-step input:checked').first().val();
	if (budget == undefined) {
		alert('Select a value please');
		return false;
	}

	budget = parseInt(budget);

	// Update the remaining object.
	for (var i in pos) {
		if (parseInt(pos[i].price) > budget) {
			console.log(pos[i].price);
			delete remaining[i];
		}
	}

	if (!showResults()) {
		if (owned.length == 0) {
			showStandaloneStep();			
		}
		else {
			showMainFeatureStep();
		}
	}
	$("#budget-step input").prop("disabled", true);
}

submitStandaloneStep = function() {
	standalone = $('#standalone-step input:checked').first().val();
	if (standalone == undefined) {
		alert('Select a value please');
		return false;
	}

	if (standalone == 'yes') {
		// Loop through the remaining POs
		for (var i in remaining) {
			if (!remaining[i].standalone) {
				delete remaining[i];
			}
		}
	}

	if (!showResults()) {
		showMainFeatureStep();
	}
	$("#standalone-step input").prop("disabled", true);
}

submitMainFeaturesStep = function() {
	feature = $('#main-feature-step input:checked').first().val();
	if (feature == undefined) {
		alert('Select a value please');
		return false;
	}

	// Loop through the remaining POs
	for (var i in remaining) {
		let keep = false;
		for (var j in remaining[i]['main_features']) {
			if (remaining[i]['main_features'] == feature) {
				keep = true;
			}
		}

		if (!keep) {
			delete remaining[i];
		}
	}

	showResults(true);
	$("#main-feature-step input").prop("disabled", true);
}

showOwnedStep = function() {
	scrollToDiv('owned-step');
	initPosList();
}

showStandaloneStep = function() {
	for (var i in remaining) {
		if (remaining[i].standalone) {
			scrollToDiv('standalone-step');
			return true;
		}
	}	

	// Show the feature step instead.
	showMainFeatureStep();
}

showMainFeatureStep = function() {
	initFeaturesList();
	scrollToDiv('main-feature-step');
} 

showResults = function(final = false) {
	let size = Object.keys(remaining).length;
	if (size > 1 && !final) {
		return false;
	}

	if (size == 0) {
		scrollToDiv('no-result-div');
		return true;
	}

	for (var i in remaining) {
		let po = remaining[i];

		$('#po-name').html(po.name);
		$('#po-description').html(po.description);
		$('#po-image').attr('src', 'images/' + po.image);
		$('#po-audio source').attr('src', 'audios/' + po.audio);

		document.getElementById('po-audio').load();
		
		$('#result-div').css('background-color', po.color);
	
		scrollToDiv('result-div');

	}
}

function scrollToDiv(div_id)
{
	$('#'+div_id).show();

	$('html,body').animate(
	{
		scrollTop: $("#"+div_id).offset().top
	},
	'slow');
}

