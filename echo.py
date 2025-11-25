# coding: utf-8

# =========================================================================
# echo_example.py
#
# Copyright (c) the Contributors as noted in the AUTHORS file.
# This file is part of Ingescape, see https://github.com/zeromq/ingescape.
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# =========================================================================

import ingescape as igs
import sys

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Echo(metaclass=Singleton):
    def __init__(self):
        # inputs
        self.toggle_1_o = None
        self.toggle_2_o = None
        self.toggle_3_o = None
        self.toggle_4_o = None
        self.slider_o = None
        self.button_1_o = None
        self.button_2_o = None
        self.button_3_o = None
        self.button_4_o = None
        self.joystick_1_x_o = None
        self.joystick_1_y_o = None
        self.joystick_2_x_o = None
        self.joystick_2_y_o = None
        self.int_value_o = None
        self.string_value_o = None
        self.double_value_o = None
        self.bool_value_o = None

    # outputs
    @staticmethod
    def set_impulsionO(self):
        igs.output_set_impulsion("impulsion")

    @property
    def toggle_1_o(self):
        return self._toggle_1_o
    @toggle_1_o.setter
    def toggle_1_o(self, value):
        self._toggle_1_o = value
        if self._toggle_1_o is not None:
            igs.output_set_bool("toggle_1", self._toggle_1_o)
        
    @property
    def toggle_2_o(self):
        return self._toggle_2_o
    @toggle_2_o.setter
    def toggle_2_o(self, value):
        self._toggle_2_o = value
        if self._toggle_2_o is not None:
            igs.output_set_bool("toggle_2", self._toggle_2_o)
            
    @property
    def toggle_3_o(self):
        return self._toggle_3_o
    @toggle_3_o.setter
    def toggle_3_o(self, value):
        self._toggle_3_o = value
        if self._toggle_3_o is not None:
            igs.output_set_bool("toggle_3", self._toggle_3_o)
            
    @property
    def toggle_4_o(self):
        return self._toggle_4_o
    @toggle_4_o.setter
    def toggle_4_o(self, value):
        self._toggle_4_o = value
        if self._toggle_4_o is not None:
            igs.output_set_bool("toggle_4", self._toggle_4_o)
            
    @property
    def slider_o(self):
        return self._slider_o
    @slider_o.setter
    def slider_o(self, value):
        self._slider_o = value
        if self._slider_o is not None:
            igs.output_set_double("slider", self._slider_o)
            
    @property
    def button_1_o(self):
        return self._button_1_o
    @button_1_o.setter
    def button_1_o(self, value):
        self._button_1_o = value
        if self._button_1_o is not None:
            igs.output_set_impulsion("button_1")
            
    @property
    def button_2_o(self):
        return self._button_2_o
    @button_2_o.setter
    def button_2_o(self, value):
        self._button_2_o = value
        if self._button_2_o is not None:
            igs.output_set_impulsion("button_2")
            
    @property
    def button_3_o(self):
        return self._button_3_o
    @button_3_o.setter
    def button_3_o(self, value):
        self._button_3_o = value
        if self._button_3_o is not None:
            igs.output_set_impulsion("button_3")
            
    @property
    def button_4_o(self):
        return self._button_4_o
    @button_4_o.setter
    def button_4_o(self, value):
        self._button_4_o = value
        if self._button_4_o is not None:
            igs.output_set_impulsion("button_4")
            
    @property
    def joystick_1_x_o(self):
        return self._joystick_1_x_o
    @joystick_1_x_o.setter
    def joystick_1_x_o(self, value):
        self._joystick_1_x_o = value
        if self._joystick_1_x_o is not None:
            igs.output_set_double("joystick_1_x", self._joystick_1_x_o)
            
    @property
    def joystick_1_y_o(self):
        return self._joystick_1_y_o
    @joystick_1_y_o.setter
    def joystick_1_y_o(self, value):
        self._joystick_1_y_o = value
        if self._joystick_1_y_o is not None:
            igs.output_set_double("joystick_1_y", self._joystick_1_y_o)
            
    @property
    def joystick_2_x_o(self):
        return self._joystick_2_x_o
    @joystick_2_x_o.setter
    def joystick_2_x_o(self, value):
        self._joystick_2_x_o = value
        if self._joystick_2_x_o is not None:
            igs.output_set_double("joystick_2_x", self._joystick_2_x_o)
            
    @property
    def joystick_2_y_o(self):
        return self._joystick_2_y_o
    @joystick_2_y_o.setter
    def joystick_2_y_o(self, value):
        self._joystick_2_y_o = value
        if self._joystick_2_y_o is not None:
            igs.output_set_double("joystick_2_y", self._joystick_2_y_o)
            
    @property
    def boolO(self):
        return self._boolO
    @boolO.setter
    def boolO(self, value):
        self._boolO = value
        if self._boolO is not None:
            igs.output_set_bool("bool_value", self._boolO)
            
    @property
    def integerO(self):
        return self._integerO
    @integerO.setter
    def integerO(self, value):
        self._integerO = value
        if self._integerO is not None:
            igs.output_set_int("int_value", self._integerO)
            
    @property
    def doubleO(self):
        return self._doubleO
    @doubleO.setter
    def doubleO(self, value):
        self._doubleO = value
        if self._doubleO is not None:
            igs.output_set_double("double_value", self._doubleO)
            
    @property
    def stringO(self):
        return self._stringO
    @stringO.setter
    def stringO(self, value):
        self._stringO = value
        if self._stringO is not None:
            igs.output_set_string("string_value", self._stringO)
            
    # services
    def receive_values(self, sender_agent_name, sender_agent_uuid, boolV, integer, double, string, data, token, my_data):
        igs.info(f"Service receive_values called by {sender_agent_name} ({sender_agent_uuid}) with argument_list {boolV, integer, double, string, data} and token '{token}''")

    def send_values(self, sender_agent_name, sender_agent_uuid, token, my_data):
        print(f"Service send_values called by {sender_agent_name} ({sender_agent_uuid}), token '{token}' sending values : {self.boolO, self.integerO, self.doubleO, self.stringO, self.dataO}")
        igs.info(sender_agent_uuid, "receive_values", (self.boolO, self.integerO, self.doubleO, self.stringO, self.dataO), token)