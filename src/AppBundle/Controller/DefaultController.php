<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Filter\ItemFilterType;


class DefaultController extends Controller
{

    public function indexAction(Request $request)
    {
        return $this->render('AppBundle:Default:index.html.twig',array());
    }


}
